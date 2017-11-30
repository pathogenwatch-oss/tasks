package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"os"
	"strconv"
	"strings"

	"github.com/pkg/bson"
)

type Allele struct {
	AlleleID  string
	Stop      int
	Start     int
	Mutations map[int]string
}

type Genome struct {
	ID        string
	FileID    string
	Variances map[string][]Allele
}

type Score struct {
	Diff  int
	Start int
	Stop  int
}

type Vector struct {
	Index  int
	Scores []int
}

type CacheOutput struct {
	FileID string         `json:"fileId"`
	Scores map[string]int `json:"scores"`
}

func absDifference(a int, b int) int {
	if a > b {
		return a - b
	}
	return b - a
}

func minInt(a int, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInt(a int, b int) int {
	if a > b {
		return a
	}
	return b
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}

func compareAlleles(queryAllele Allele, subjectAllele Allele) Score {
	if queryAllele.AlleleID == subjectAllele.AlleleID {
		return Score{
			Diff:  0,
			Start: queryAllele.Start,
			Stop:  queryAllele.Stop,
		}
	}
	start := maxInt(queryAllele.Start, subjectAllele.Start)
	stop := minInt(queryAllele.Stop, subjectAllele.Stop)
	shared := 0
	foundQueryMutations := 0
	foundSubjectMutations := 0

	for location, queryNucleotide := range queryAllele.Mutations {
		if location >= start && location <= stop {
			if subjectNucleotide, ok := subjectAllele.Mutations[location]; ok {
				if queryNucleotide == subjectNucleotide {
					shared++
				}
			}
			foundQueryMutations++
		}
	}

	for location := range subjectAllele.Mutations {
		if location >= start && location <= stop {
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

func compare(expectedKernelSize int, query map[string][]Allele, subject map[string][]Allele) int {
	sharedNts := 0
	numDifferences := 0

	for queryFamilyID, queryVariance := range query {
		if subjectVariance, ok := subject[queryFamilyID]; ok {
			scores := scoreFunction(queryVariance, subjectVariance)
			for _, score := range scores {
				sharedNts += absDifference(score.Stop, score.Start) + 1
				numDifferences += score.Diff
			}
		}
	}

	if sharedNts == 0 {
		return expectedKernelSize
	}

	if numDifferences == 0 {
		return 0
	}

	score := float64(numDifferences) / (float64(sharedNts) / float64(expectedKernelSize))
	return int(math.Floor(score + 0.5))
}

func vector(expectedKernelSize int, docs []Genome, cache map[string]map[string]int, queryIndex int) Vector {
	query := docs[queryIndex]

	subjects := docs[:queryIndex]
	scores := make([]int, len(subjects))

	for index, subject := range subjects {
		if cachedGenome, ok := cache[query.FileID]; ok {
			if cachedScore, ok := cachedGenome[subject.FileID]; ok {
				scores[index] = cachedScore
				continue
			}
		}

		scores[index] = compare(expectedKernelSize, query.Variances, subject.Variances)
	}

	return Vector{
		Index:  queryIndex,
		Scores: scores,
	}
}

func worker(expectedKernelSize int, docs []Genome, cache map[string]map[string]int, jobs <-chan int, results chan<- Vector) {
	for j := range jobs {
		results <- vector(expectedKernelSize, docs, cache, j)
	}
}

func createGenome(doc map[string]interface{}) Genome {
	rawVariance := doc["analysis"].(map[string]interface{})["core"].(map[string]interface{})["variance"].(map[string]interface{})
	variances := make(map[string][]Allele)
	for k, v := range rawVariance {
		rawAlleles := v.([]interface{})
		alleles := make([]Allele, 0)
		for _, allele := range rawAlleles {
			rawAllele := allele.(map[string]interface{})
			rawMutations := rawAllele["mutations"].(map[string]interface{})
			mutations := make(map[int]string)
			for p, n := range rawMutations {
				position, err := strconv.Atoi(p)
				check(err)
				mutations[position] = n.(string)
			}
			alleles = append(alleles, Allele{
				AlleleID:  rawAllele["alleleId"].(string),
				Start:     int(rawAllele["start"].(int32)),
				Stop:      int(rawAllele["stop"].(int32)),
				Mutations: mutations,
			})
		}

		variances[k] = alleles
	}
	_id := doc["_id"].(bson.ObjectId)
	return Genome{
		ID:        fmt.Sprintf("%x", _id),
		FileID:    doc["fileId"].(string),
		Variances: variances,
	}
}

func output(genomes []Genome, matrix [][]int) {
	file, err := os.Create("matrix.csv")
	check(err)

	ids := make([]string, len(genomes)+1)
	ids[0] = "ID"
	for i, doc := range genomes {
		ids[i+1] = doc.ID
	}
	_, writeErr1 := file.WriteString(strings.Join(ids, "\t") + "\n")
	check(writeErr1)

	for i := range genomes {
		line := make([]string, len(matrix[i])+1)
		line[0] = ids[i+1]
		for j, cell := range matrix[i] {
			line[j+1] = strconv.Itoa(cell)
		}
		_, writeErr2 := file.WriteString(strings.Join(line, "\t") + "\n")
		check(writeErr2)
	}
}

func buildMatrix(expectedKernelSize int, workers int, genomes []Genome, cache map[string]map[string]int) [][]int {
	numDocs := len(genomes)

	jobs := make(chan int, numDocs*2)
	results := make(chan Vector, numDocs*2)

	for j := 0; j < workers; j++ {
		go worker(expectedKernelSize, genomes, cache, jobs, results)
	}

	for i := 1; i < numDocs; i++ {
		jobs <- i
	}
	close(jobs)

	enc := json.NewEncoder(os.Stdout)

	matrix := make([][]int, numDocs)
	for i := 1; i < numDocs; i++ {
		v := <-results
		matrix[v.Index] = v.Scores
		cahcedScores := make(map[string]int)
		for j, score := range v.Scores {
			cahcedScores[genomes[j].FileID] = score
		}
		enc.Encode(CacheOutput{
			FileID: genomes[v.Index].FileID,
			Scores: cahcedScores,
		})
		// log.Println("line inserted", v.Index)
	}
	return matrix
}

func readDocs(r io.Reader) ([]Genome, map[string]map[string]int) {
	dec := bson.NewDecoder(os.Stdin)

	docs := make([]Genome, 0)
	cache := make(map[string]map[string]int)

	for {
		d := make(map[string]interface{})
		if err := dec.Decode(&d); err != nil {
			log.Println(err)
			if err != io.EOF {
				os.Exit(1)
			}
			return docs, cache
		}
		if _, ok := d["scores"]; ok {
			fileId1 := d["fileId"].(string)
			if _, ok := cache[fileId1]; !ok {
				cache[fileId1] = make(map[string]int)
			}
			scores := d["scores"].(map[string]interface{})
			for fileId2, score := range scores {
				cache[fileId1][fileId2] = int(score.(int32))
			}
		} else {
			docs = append(docs, createGenome(d))
		}
	}
}

func main() {
	expectedKernelSize := flag.Int("kernel", 1755637, "Expected kernel size")
	workers := flag.Int("workers", 2, "Number of workers to use")

	flag.Parse()
	log.Println("workers=", *workers, ",", "Expected kernel size=", *expectedKernelSize)

	stream := os.Stdin
	genomes, cache := readDocs(stream)
	matrix := buildMatrix(*expectedKernelSize, *workers, genomes, cache)
	output(genomes, matrix)
}
