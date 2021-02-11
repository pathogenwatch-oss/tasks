# Reference alignment

| Revision | minimap2 version  | Description |
| -------- | ----------------- | ----------- |
| 1        | v2.17             | Reference alignment using minimap2 |


## Input

A stream of fasta file from stdin

## Output

JSON with the following keys:
```
{
  "sam": "SAM file content",
}
```