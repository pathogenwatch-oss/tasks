package main

import (
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

func calculateRangeOverlap(query map[string]interface{}, subject map[string]interface{}) (int, int) {
	queryStart := query["start"].(int32)
	subjectStart := subject["start"].(int32)
	queryStop := query["stop"].(int32)
	subjectStop := subject["stop"].(int32)

	maxStart := queryStart
	if queryStart < subjectStart {
		maxStart = subjectStart
	}

	minStop := queryStop
	if queryStop > subjectStop {
		minStop = subjectStop
	}

	return int(maxStart), int(minStop)
}

func compareAlleles(queryAllele map[string]interface{}, subjectAllele map[string]interface{}) Score {
	if queryAllele["alleleId"].(string) == subjectAllele["alleleId"].(string) {
		return Score{
			Diff:  0,
			Start: int(queryAllele["start"].(int32)),
			Stop:  int(queryAllele["stop"].(int32)),
		}
	}
	start, stop := calculateRangeOverlap(queryAllele, subjectAllele)
	shared := 0
	foundQueryMutations := 0
	foundSubjectMutations := 0

	queryMutations := queryAllele["mutations"].(map[string]interface{})
	subjectMutations := subjectAllele["mutations"].(map[string]interface{})

	for k, queryMutation := range queryMutations {
		position, err := strconv.Atoi(k)
		if err != nil {
			panic(err)
		}
		if position >= start && position <= stop {
			if subjectMutation, ok := subjectMutations[k]; ok {
				if queryMutation == subjectMutation {
					shared++
				}
			}
			foundQueryMutations++
		}
	}

	for k := range subjectMutations {
		position, err := strconv.Atoi(k)
		if err != nil {
			panic(err)
		}
		if position >= start && position <= stop {
			foundSubjectMutations++
		}
	}

	return Score{
		Diff:  (foundQueryMutations - shared) + (foundSubjectMutations - shared),
		Start: int(start),
		Stop:  int(stop),
	}
}

func scoreFunction(queryAlleles []interface{}, subjectAlleles []interface{}) []Score {
	if len(queryAlleles) == 1 && len(subjectAlleles) == 1 {
		score := compareAlleles(
			queryAlleles[0].(map[string]interface{}),
			subjectAlleles[0].(map[string]interface{}),
		)
		return []Score{score}
	}

	sharedCount := len(queryAlleles)
	if len(queryAlleles) > len(subjectAlleles) {
		sharedCount = len(subjectAlleles)
	}
	data := make(map[string]map[string]Score)

	for _, q := range queryAlleles {
		queryAllele := q.(map[string]interface{})
		data[queryAllele["alleleId"].(string)] = make(map[string]Score)
		for _, s := range subjectAlleles {
			subjectAllele := s.(map[string]interface{})
			score := compareAlleles(queryAllele, subjectAllele)
			data[queryAllele["alleleId"].(string)][subjectAllele["alleleId"].(string)] = score
		}
	}

	// Got all diff scores, so now pair up by using greedy pair wise approach
	allPaired := false
	seenPair := make(map[string]bool)
	seenFirst := make(map[string]bool)
	scores := make([]Score, 0)

	minDiffs := 0

	for !allPaired {
		for alleleId1 := range data {
			if seenFirst[alleleId1] {
				continue
			}
			for alleleId2 := range data[alleleId1] {
				if data[alleleId1][alleleId2].Diff == minDiffs && !seenPair[alleleId2] {
					scores = append(scores, data[alleleId1][alleleId2])
					// Now ensure neither is used in another pairing.
					seenFirst[alleleId1] = true
					seenPair[alleleId2] = true
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

func compare(expectedKernelSize int, query map[string]interface{}, subject map[string]interface{}, i int) int {
	sharedNts := 0
	numDifferences := 0

	for familyId, queryAlleles := range query {
		if subjectAlleles, ok := subject[familyId]; ok {
			// log.Println(familyId, len(queryAlleles.([]interface{})), len(subjectAlleles.([]interface{})))
			scores := scoreFunction(queryAlleles.([]interface{}), subjectAlleles.([]interface{}))
			for _, score := range scores {
				sharedNts += score.Stop - score.Start + 1
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
	// log.Println("***", sharedNts, numDifferences, expectedKernelSize)

	score := float64(numDifferences) / (float64(sharedNts) / float64(expectedKernelSize))
	return int(math.Floor(score + 0.5))
}

func count(doc map[string]interface{}, i int, c chan int) {
	time.Sleep(time.Second)
	log.Println("index", i, len(doc))
	c <- len(doc)
}

func vector(expectedKernelSize int, docs []map[string]interface{}, queryIndex int, c chan Vector) {
	query := docs[queryIndex]
	queryProfile := query["analysis"].(map[string]interface{})["core"].(map[string]interface{})["variance"].(map[string]interface{})

	scores := make([]string, 0)

	subjects := docs[:queryIndex]

	for i, doc := range subjects {
		subjectProfile := doc["analysis"].(map[string]interface{})["core"].(map[string]interface{})["variance"].(map[string]interface{})
		score := compare(expectedKernelSize, queryProfile, subjectProfile, i)
		scores = append(scores, strconv.Itoa(score))
	}

	c <- Vector{
		Index:  queryIndex,
		Scores: scores,
	}
}

func main() {
	expectedKernelSize := 1755637
	dec := bson.NewDecoder(os.Stdin)
	docs := make([]map[string]interface{}, 0)
	for {
		d := make(map[string]interface{})
		if err := dec.Decode(&d); err != nil {
			log.Println(err)
			log.Println(len(docs), expectedKernelSize)

			c := make(chan Vector)
			threads := 16

			lines := make([]string, len(docs))

			for i := 0; i < len(docs)-threads+1; i += threads {
				for j := 0; j < threads; j++ {
					if j+i < len(docs) {
						go vector(expectedKernelSize, docs, i+j, c)
					}
				}
				for j := 0; j < threads; j++ {
					v := <-c
					lines[v.Index] = strings.Join(v.Scores, "\t")
					fmt.Println(v.Index)
				}
			}

			ids := make([]string, len(docs))
			for i, doc := range docs {
				ids[i] = doc["_id"].(string)
			}
			fmt.Println("ID", strings.Join(ids, "\t"))

			for i := range docs {
				fmt.Println(ids[i], "\t", lines[i])
			}

			return
		}
		docs = append(docs, d)
	}
}
