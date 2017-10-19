package main

import (
    "encoding/json"
    "os"
    "os/exec"
    "fmt"
    "strings"
)

type output struct {
    Ngmast string `json:"ngmast"`
    Por string `json:"por"`
    Tbpb string `json:"tbpb"`
}

func parse(raw string) *output {
    lines := strings.Split(raw, "\n")
    values := strings.Split(lines[1], "\t")
    o := output {
        Ngmast: values[1],
        Por: values[2],
        Tbpb: values[3],
    }
    return &o
}

func main() {
    filepath := os.Args[1]
    raw, err := exec.Command("ngmaster", filepath).Output()
    if err != nil {
        panic(err)
    }
    out, err := json.Marshal(parse(string(raw)))
    if err != nil {
        panic(err)
    }
    fmt.Println(string(out))
}
