# alignment trees

| Revision | FastTree version     | Description |
| -------- | -------------------- | ----------- |
| 1        | 2.1.11 DPI (No SSE3) | Builds trees from SAM alignment input |
| 2        | 2.1.11 DPI (No SSE3) | Accepts FASTA input instead of SAM |
| 3        | 2.1.11 DPI (No SSE3) | Prune and root tree |

## Input

A stream of BSON document, each of which is in the following format:

```json
{
  "_id": "genome MongoDB ObjectId",
  "fileId": "File checksum",
  "analysis": {
    "alignment": {
      "fasta": "..."
    }
  }
}
```

## Output

JSON with the following keys:

```json
{
  "newick": "tree file content",
}
```