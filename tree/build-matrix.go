package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"os"
	"regexp"
	"sort"
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
	ID     string
	FileID string
}

type Score struct {
	Diff   int
	Length int
}

type Vector struct {
	Index       int
	Scores      []int
	Differences []int
}

type CacheOutput struct {
	FileID      string         `json:"fileId"`
	Differences map[string]int `json:"differences"`
	Scores      map[string]int `json:"scores"`
	Progress    float32        `json:"progress"`
}

type Context struct {
	Genomes      []Genome
	GenomeByID   map[string]Genome
	VarianceData map[string]map[string][]Allele
	ScoreCache   map[string]map[string]int
}

type PairedScore struct {
	Allele1 string
	Allele2 string
	Score   Score
}

type ByDiff []PairedScore

func (s ByDiff) Len() int {
	return len(s)
}
func (s ByDiff) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
func (s ByDiff) Less(i, j int) bool {
	return s[i].Score.Diff < s[j].Score.Diff
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
			Diff:   0,
			Length: absDifference(queryAllele.Stop, queryAllele.Start) + 1,
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
		Diff:   (foundQueryMutations - shared) + (foundSubjectMutations - shared),
		Length: absDifference(stop, start) + 1,
	}
}

func scoreFunction(queryAlleles []Allele, subjectAlleles []Allele) []Score {
	if len(queryAlleles) == 1 && len(subjectAlleles) == 1 {
		score := compareAlleles(queryAlleles[0], subjectAlleles[0])
		return []Score{score}
	}

	sharedCount := minInt(len(queryAlleles), len(subjectAlleles))
	data := make([]PairedScore, 0)

	for _, queryAllele := range queryAlleles {
		for _, subjectAllele := range subjectAlleles {
			score := compareAlleles(queryAllele, subjectAllele)
			data = append(data, PairedScore{
				Allele1: queryAllele.AlleleID,
				Allele2: subjectAllele.AlleleID,
				Score:   score,
			})
		}
	}
	sort.Sort(ByDiff(data))

	seen1 := make(map[string]bool)
	seen2 := make(map[string]bool)
	scores := make([]Score, 0)

	for _, pair := range data {
		if seen1[pair.Allele1] || seen2[pair.Allele2] {
			continue
		}
		scores = append(scores, pair.Score)
		if len(scores) == sharedCount {
			break
		}
		seen1[pair.Allele1] = true
		seen2[pair.Allele2] = true
	}

	return scores
}

func compareProfiles(expectedKernelSize int, query map[string][]Allele, subject map[string][]Allele) (int, int) {
	sharedNts := 0
	numDifferences := 0

	for queryFamilyID, queryVariance := range query {
		if subjectVariance, ok := subject[queryFamilyID]; ok {
			scores := scoreFunction(queryVariance, subjectVariance)
			for _, score := range scores {
				sharedNts += score.Length
				numDifferences += score.Diff
			}
		}
	}

	if sharedNts == 0 {
		return 0, expectedKernelSize
	}

	if numDifferences == 0 {
		return 0, 0
	}

	score := float64(numDifferences) / (float64(sharedNts) / float64(expectedKernelSize))
	return numDifferences, int(math.Floor(score + 0.5))
}

func vector(expectedKernelSize int, context Context, queryIndex int) Vector {
	query := context.Genomes[queryIndex]
	subjects := context.Genomes[:queryIndex]
	diffs := make([]int, len(subjects))
	scores := make([]int, len(subjects))

	for index, subject := range subjects {
		if cachedGenome, ok := context.ScoreCache[query.FileID]; ok {
			if cachedScore, ok := cachedGenome[subject.FileID]; ok {
				scores[index] = cachedScore
				continue
			}
		}

		queryProfile, queryFound := context.VarianceData[query.ID]
		subjectProfile, subjectFound := context.VarianceData[subject.ID]
		if !queryFound {
			panic("Missing genome " + query.ID + " (" + query.FileID + ")")
		}
		if !subjectFound {
			panic("Missing genome " + subject.ID + " (" + subject.FileID + ")")
		}

		diff, score := compareProfiles(expectedKernelSize, queryProfile, subjectProfile)
		diffs[index] = diff
		scores[index] = score
	}

	return Vector{
		Index:       queryIndex,
		Scores:      scores,
		Differences: diffs,
	}
}

func worker(expectedKernelSize int, context Context, jobs <-chan int, results chan<- Vector) {
	for j := range jobs {
		results <- vector(expectedKernelSize, context, j)
	}
}

func createGenome(doc map[string]interface{}) Genome {
	return Genome{
		ID:     fmt.Sprintf("%x", doc["_id"].(bson.ObjectId)),
		FileID: doc["fileId"].(string),
	}
}

var re = regexp.MustCompile("[^ACTG]")

func isValidMutation(mut string) bool {
	return len(re.FindString(mut)) == 0
}

func createGenomeVariance(doc map[string]interface{}) map[string][]Allele {
	core := doc["analysis"].(map[string]interface{})["core"].(map[string]interface{})
	if _, ok := core["profile"]; !ok {
		panic("Profile not found")
	}

	rawProfile := doc["analysis"].(map[string]interface{})["core"].(map[string]interface{})["profile"].([]interface{})
	variances := make(map[string][]Allele)
	for _, v := range rawProfile {
		rawProfileEntry := v.(map[string]interface{})
		familyID := rawProfileEntry["id"].(string)
		rawAlleles := rawProfileEntry["alleles"].([]interface{})
		alleles := make([]Allele, 0)
		for _, allele := range rawAlleles {
			rawAllele := allele.(map[string]interface{})
			rawMutations := rawAllele["mutations"].(map[string]interface{})
			mutations := make(map[int]string)
			for p, n := range rawMutations {
				if isValidMutation(n.(string)) {
					position, err := strconv.Atoi(p)
					check(err)
					mutations[position] = n.(string)
				}
			}
			start := int(rawAllele["rstart"].(int32))
			stop := int(rawAllele["rstop"].(int32))
			alleles = append(alleles, Allele{
				AlleleID:  rawAllele["id"].(string),
				Start:     minInt(start, stop),
				Stop:      maxInt(start, stop),
				Mutations: mutations,
			})
		}
		variances[familyID] = alleles
	}
	return variances
}

func outputMatrix(context Context, matrix [][]int) {
	file, err := os.Create("matrix.csv")
	check(err)

	ids := make([]string, len(context.Genomes)+1)
	ids[0] = "ID"
	for i, doc := range context.Genomes {
		ids[i+1] = doc.ID
		// ids[i+1] = strconv.Itoa(i)
	}
	_, writeErr1 := file.WriteString(strings.Join(ids, "\t") + "\n")
	check(writeErr1)

	for i := range context.Genomes {
		line := make([]string, len(matrix[i])+1)
		line[0] = ids[i+1]
		for j, cell := range matrix[i] {
			line[j+1] = strconv.Itoa(cell)
		}
		_, writeErr2 := file.WriteString(strings.Join(line, "\t") + "\n")
		check(writeErr2)
	}
}

func buildMatrix(expectedKernelSize int, workers int, context Context) [][]int {
	numDocs := len(context.Genomes)

	jobs := make(chan int, numDocs*2)
	results := make(chan Vector, numDocs*2)

	for j := 0; j < workers; j++ {
		go worker(expectedKernelSize, context, jobs, results)
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
		cachedScores := make(map[string]int)
		cachedDiffs := make(map[string]int)
		for j, score := range v.Scores {
			if _, found := context.ScoreCache[context.Genomes[v.Index].FileID][context.Genomes[j].FileID]; !found {
				cachedScores[context.Genomes[j].FileID] = score
				cachedDiffs[context.Genomes[j].FileID] = v.Differences[j]
			}
		}
		index := float32(v.Index + 1)
		total := float32(numDocs)
		enc.Encode(CacheOutput{
			FileID:      context.Genomes[v.Index].FileID,
			Scores:      cachedScores,
			Differences: cachedDiffs,
			Progress:    ((index * index) - index) / ((total * total) - total) * 100,
		})
	}
	return matrix
}

func readInputDocs(r io.Reader) Context {
	log.Println("Reading docs...")
	dec := bson.NewDecoder(r)

	genomes := make([]Genome, 0)
	docByID := make(map[string]Genome)
	varianceData := make(map[string]map[string][]Allele)
	cache := make(map[string]map[string]int)

	for {
		d := make(map[string]interface{})
		if err := dec.Decode(&d); err != nil {
			log.Println(err)
			if err != io.EOF {
				os.Exit(1)
			}
			log.Println("")
			log.Println("Read all docs")
			log.Println("Score cache", len(cache))
			log.Println("Genomes", len(genomes))
			log.Println("Variance profiles", len(varianceData))
			return Context{
				Genomes:      genomes,
				GenomeByID:   docByID,
				VarianceData: varianceData,
				ScoreCache:   cache,
			}
		}
		if _, ok := d["genomes"]; ok {
			for _, rawDoc := range d["genomes"].([]interface{}) {
				doc := rawDoc.(map[string]interface{})
				genomeDoc := Genome{
					ID:     fmt.Sprintf("%x", doc["_id"].(bson.ObjectId)),
					FileID: doc["fileId"].(string),
				}
				docByID[genomeDoc.ID] = genomeDoc
				genomes = append(genomes, genomeDoc)
			}
			log.Println("Read genomes doc of size", len(genomes))
		} else if _, ok := d["scores"]; ok {
			fileID1 := d["fileId"].(string)
			if _, ok := cache[fileID1]; !ok {
				cache[fileID1] = make(map[string]int)
			}
			scores := d["scores"].(map[string]interface{})
			for fileID2, score := range scores {
				cache[fileID1][fileID2] = int(score.(int32))
			}
			log.Println("Read score cache doc of size", len(cache[fileID1]), len(cache))
		} else if _, ok := d["analysis"]; ok {
			id := fmt.Sprintf("%x", d["_id"].(bson.ObjectId))
			varianceData[id] = createGenomeVariance(d)
			log.Println("Read variance data doc of size", len(varianceData[id]), len(varianceData))
		} else {
			panic("Invalid input doc")
		}
	}
}

func main() {
	expectedKernelSize := flag.Int("kernel", 0, "Expected kernel size")
	workers := flag.Int("workers", 2, "Number of workers to use")

	flag.Parse()
	log.Println("workers=", *workers, ",", "Expected kernel size=", *expectedKernelSize)

	stream := os.Stdin
	// stream, err := os.Open("/Users/kad/Downloads/fasta/harris-et-al-2013/t3/tree-input-1-simons.bson")
	// check(err)
	context := readInputDocs(stream)
	matrix := buildMatrix(*expectedKernelSize, *workers, context)
	outputMatrix(context, matrix)
}
