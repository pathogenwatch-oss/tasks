# Reference alignment

| Revision | minimap2 version  | Description |
| -------- | ----------------- | ----------- |
| 1        | v2.17             | Reference alignment using minimap2 |
| 2        | v2.17             | Convert SAM to FASTA |
| 3        | v2.17             | Use [gofasta](https://github.com/cov-ert/gofasta) |

## Input

A stream of fasta file from stdin

## Output

JSON with the following keys:
```
{
  "fasta": "FASTA file content",
}
```