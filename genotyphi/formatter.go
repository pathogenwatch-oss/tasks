package main

import (
    "encoding/json"
    "os"
    "io/ioutil"
)

type output struct {
    Genotype string `json:"genotype"`
    FoundLoci int `json:"foundLoci"`
}

func main() {
    in, err := ioutil.ReadAll(os.Stdin)
    if err != nil {
        panic(err)
    }

    var o output

    err = json.Unmarshal(in, &o)
    if err != nil {
        panic(err)
    }

    out, err := json.Marshal(o)
    if err != nil {
        panic(err)
    }

    os.Stdout.Write(out)
}
