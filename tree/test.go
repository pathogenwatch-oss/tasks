package main

import (
	"flag"
	"fmt"
	"log"
	"math"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/pkg/bson"
)

type Score struct {
	Diff  int
	Start int
	Stop  int
}

type Vector struct {
	Index  int
	Scores []string
}

type Mutation struct {
	Location   int
	Nucleotide string
}

type Allele struct {
	AlleleID  string
	Stop      int
	Start     int
	Mutations []Mutation
}

type Variance struct {
	FamilyID string
	Alleles  []Allele
}

type Genome struct {
	ID        string
	FileID    string
	Variances []Variance
}

func calculateRangeOverlap(query Allele, subject Allele) (int, int) {
	maxStart := query.Start
	if query.Start < subject.Start {
		maxStart = subject.Start
	}

	minStop := query.Stop
	if query.Stop > subject.Stop {
		minStop = subject.Stop
	}

	return maxStart, minStop
}

func compareAlleles(queryAllele Allele, subjectAllele Allele) Score {
	if queryAllele.AlleleID == subjectAllele.AlleleID {
		return Score{
			Diff:  0,
			Start: queryAllele.Start,
			Stop:  queryAllele.Stop,
		}
	}
	start, stop := calculateRangeOverlap(queryAllele, subjectAllele)
	shared := 0
	foundQueryMutations := 0
	foundSubjectMutations := 0

	for _, queryMutation := range queryAllele.Mutations {
		if queryMutation.Location >= start && queryMutation.Location <= stop {
			for _, subjectMutation := range subjectAllele.Mutations {
				if queryMutation.Location == subjectMutation.Location {
					if queryMutation.Nucleotide == subjectMutation.Nucleotide {
						shared++
					}
					break
				}
			}
			foundQueryMutations++
		}
	}

	for _, subjectMutation := range subjectAllele.Mutations {
		if subjectMutation.Location >= start && subjectMutation.Location <= stop {
			foundSubjectMutations++
		}
	}

	return Score{
		Diff:  (foundQueryMutations - shared) + (foundSubjectMutations - shared),
		Start: int(start),
		Stop:  int(stop),
	}
}

func scoreFunction(queryAlleles []Allele, subjectAlleles []Allele) []Score {
	if len(queryAlleles) == 1 && len(subjectAlleles) == 1 {
		score := compareAlleles(queryAlleles[0], subjectAlleles[0])
		return []Score{score}
	}

	sharedCount := len(queryAlleles)
	if len(queryAlleles) > len(subjectAlleles) {
		sharedCount = len(subjectAlleles)
	}
	data := make(map[string]map[string]Score)

	for _, queryAllele := range queryAlleles {
		data[queryAllele.AlleleID] = make(map[string]Score)
		for _, subjectAllele := range subjectAlleles {
			score := compareAlleles(queryAllele, subjectAllele)
			data[queryAllele.AlleleID][subjectAllele.AlleleID] = score
		}
	}

	// Got all diff scores, so now pair up by using greedy pair wise approach
	allPaired := false
	seenPair := make(map[string]bool)
	seenFirst := make(map[string]bool)
	scores := make([]Score, 0)

	minDiffs := 0

	for !allPaired {
		for alleleID1 := range data {
			if seenFirst[alleleID1] {
				continue
			}
			for alleleID2 := range data[alleleID1] {
				if data[alleleID1][alleleID2].Diff == minDiffs && !seenPair[alleleID2] {
					scores = append(scores, data[alleleID1][alleleID2])
					// Now ensure neither is used in another pairing.
					seenFirst[alleleID1] = true
					seenPair[alleleID2] = true
					break
				}
			}
		}
		minDiffs++
		if len(seenFirst) == sharedCount {
			allPaired = true // last pair seen
		}
	}

	return scores
}

func absDifference(a int, b int) int {
	if a > b {
		return a - b
	}
	return b - a
}

func compare(expectedKernelSize int, query []Variance, subject []Variance) int {
	sharedNts := 0
	numDifferences := 0

	for _, queryVariance := range query {
		for _, subjectVariance := range subject {
			if queryVariance.FamilyID == subjectVariance.FamilyID {
				scores := scoreFunction(queryVariance.Alleles, subjectVariance.Alleles)
				for _, score := range scores {
					sharedNts += absDifference(score.Stop, score.Start) + 1
					numDifferences += score.Diff
				}
				break
			}
		}
	}

	if sharedNts == 0 {
		return expectedKernelSize
	}

	if numDifferences == 0 {
		return 0
	}
	// log.Println("***", sharedNts, numDifferences, expectedKernelSize)

	score := float64(numDifferences) / (float64(sharedNts) / float64(expectedKernelSize))
	return int(math.Floor(score + 0.5))
}

func count(doc map[string]interface{}, i int, c chan int) {
	time.Sleep(time.Second)
	log.Println("index", i, len(doc))
	c <- len(doc)
}

func vector(expectedKernelSize int, docs []Genome, queryIndex int) Vector {
	query := docs[queryIndex]

	scores := make([]string, 0)

	subjects := docs[:queryIndex]

	for _, doc := range subjects {
		score := compare(expectedKernelSize, query.Variances, doc.Variances)
		scores = append(scores, strconv.Itoa(score))
	}

	return Vector{
		Index:  queryIndex,
		Scores: scores,
	}
}

func worker(expectedKernelSize int, docs []Genome, jobs <-chan int, results chan<- Vector) {
	for j := range jobs {
		results <- vector(expectedKernelSize, docs, j)
	}
}

func createGenome(doc map[string]interface{}) Genome {
	rawVariance := doc["analysis"].(map[string]interface{})["core"].(map[string]interface{})["variance"].(map[string]interface{})
	variances := make([]Variance, 0)
	for k, v := range rawVariance {
		rawAlleles := v.([]interface{})
		alleles := make([]Allele, 0)
		for _, allele := range rawAlleles {
			rawAllele := allele.(map[string]interface{})
			rawMutations := rawAllele["mutations"].(map[string]interface{})
			mutations := make([]Mutation, 0)
			for p, n := range rawMutations {
				position, err := strconv.Atoi(p)
				if err != nil {
					panic(err)
				}
				mutations = append(mutations, Mutation{
					Location:   position,
					Nucleotide: n.(string),
				})
			}
			alleles = append(alleles, Allele{
				AlleleID:  rawAllele["alleleId"].(string),
				Start:     int(rawAllele["start"].(int32)),
				Stop:      int(rawAllele["stop"].(int32)),
				Mutations: mutations,
			})
		}

		variances = append(variances, Variance{
			FamilyID: k,
			Alleles:  alleles,
		})
	}
	return Genome{
		ID:        doc["_id"].(string),
		FileID:    doc["fileId"].(string),
		Variances: variances,
	}
}

// func createGenome(doc map[string]interface{}) Genome {
// 	rawVariance := doc["analysis"].(map[string]interface{})["core"].(map[string]interface{})["variance"].(map[string]interface{})
// 	variances := make([]Variance, 0)
// 	for k, v := range rawVariance {
// 		rawAlleles := v.([]interface{})
// 		alleles := make([]Allele, 0)
// 		for _, allele := range rawAlleles {
// 			rawAllele := allele.(map[string]interface{})
// 			rawMutations := rawAllele["mutations"].(map[string]interface{})
// 			mutations := make([]Mutation, 0)
// 			for p, n := range rawMutations {
// 				position, err := strconv.Atoi(p)
// 				if err != nil {
// 					panic(err)
// 				}
// 				mutations = append(mutations, Mutation{
// 					Location:   position,
// 					Nucleotide: n.(string),
// 				})
// 			}
// 			alleles = append(alleles, Allele{
// 				AlleleID:  rawAllele["alleleId"].(string),
// 				Start:     int(rawAllele["start"].(int32)),
// 				Stop:      int(rawAllele["stop"].(int32)),
// 				Mutations: mutations,
// 			})
// 		}

// 		variances = append(variances, Variance{
// 			FamilyID: k,
// 			Alleles:  alleles,
// 		})
// 	}
// 	return Genome{
// 		ID:        doc["_id"].(string),
// 		FileID:    doc["fileId"].(string),
// 		Variances: variances,
// 	}
// }

func main() {
	expectedKernelSize := 1755637
	dec := bson.NewDecoder(os.Stdin)

	// numDocs := flag.Int("size", 1, "Size of the matrix")
	threads := flag.Int("threads", 2, "Number of threads to use")

	flag.Parse()
	log.Println(*threads, "threads")

	docs := make([]Genome, 0)

	for {
		d := make(map[string]interface{})
		if err := dec.Decode(&d); err != nil {
			log.Println(err)

			numDocs := len(docs)
			log.Println(numDocs, expectedKernelSize)

			jobs := make(chan int, numDocs*2)
			results := make(chan Vector, numDocs*2)

			for j := 0; j < *threads; j++ {
				go worker(expectedKernelSize, docs, jobs, results)
			}

			for i := 1; i < numDocs; i++ {
				jobs <- i
			}
			close(jobs)

			lines := make([]string, numDocs)
			for i := 1; i < numDocs; i++ {
				v := <-results
				lines[v.Index] = strings.Join(v.Scores, "\t")
				log.Println("line inserted", v.Index)
			}

			ids := make([]string, numDocs)
			for i, doc := range docs {
				ids[i] = doc.ID
			}
			fmt.Println("ID\t" + strings.Join(ids, "\t"))

			for i := range docs {
				fmt.Println(ids[i] + "\t" + lines[i])
			}

			return
		}
		docs = append(docs, createGenome(d))
	}
}

// func main() {
// 	expectedKernelSize := 1755637

// 	f, err := os.Open("../../../bson-testing/new-tree-input.bson")
// 	if err != nil {
// 		panic(err)
// 	}

// 	dec := bson.NewDecoder(f)

// 	// numDocs := flag.Int("size", 1, "Size of the matrix")
// 	threads := flag.Int("threads", 2, "Number of threads to use")

// 	flag.Parse()
// 	fmt.Println(*threads, "threads")

// 	docs := make([]Genome, 0)

// 	for {
// 		d := make(map[string]interface{})
// 		if err := dec.Decode(&d); err != nil {
// 			log.Println(err)

// 			numDocs := len(docs)
// 			log.Println(numDocs, expectedKernelSize)

// 			// jobs := make(chan int, numDocs*2)
// 			// results := make(chan Vector, numDocs*2)

// 			// for j := 0; j < *threads; j++ {
// 			// 	go worker(expectedKernelSize, docs, jobs, results)
// 			// }

// 			// for i := 1; i < numDocs; i++ {
// 			// 	jobs <- i
// 			// }
// 			// close(jobs)

// 			// lines := make([]string, numDocs)
// 			// for i := 53; i < numDocs; i++ {
// 			// 	v := vector(expectedKernelSize, docs, i)
// 			// 	lines[v.Index] = strings.Join(v.Scores, "\t")
// 			// 	fmt.Println("line inserted", v.Index)
// 			// }

// 			// ids := make([]string, numDocs)
// 			// for i, doc := range docs {
// 			// 	ids[i] = doc.ID
// 			// 	fmt.Println(ids)
// 			// }
// 			// fmt.Println("ID", strings.Join(ids, "\t"))

// 			// for i := range docs {
// 			// 	fmt.Println(ids[i], "\t", lines[i])
// 			// }

// 			fmt.Print(compare(expectedKernelSize, docs[50].Variances, docs[49].Variances))

// 			return
// 		}
// 		docs = append(docs, createGenome(d))
// 	}
// }
