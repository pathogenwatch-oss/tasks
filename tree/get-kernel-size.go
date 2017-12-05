package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

func main() {
	decoder := json.NewDecoder(os.Stdin)
	decoder.UseNumber()
	json := make(map[string]interface{})
	for {
		if err := decoder.Decode(&json); err != nil {
			log.Println(err)
			if err != io.EOF {
				os.Exit(1)
			} else {
				fmt.Print(json["kernelSize"])
				break
			}
		}
	}
}
