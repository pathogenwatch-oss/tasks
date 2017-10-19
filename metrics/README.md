# Metrics

## Input

a stream of fasta file from stdin

## Output

JSON with the following keys:
```
{
  length: Number,
  contigs: Number,
  smallestContig: Number,
  largestContig: Number,
  averageContig: Number,
  N50: Number,
  N50Contig: Number,
  nonATCG: Number,
  gcContent: Number,
  contigSums: [ Number ],
}
```
