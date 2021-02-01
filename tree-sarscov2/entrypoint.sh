#!/usr/bin/env sh

set -e

mkdir -p /sam /align

node /save-sam-files.js /sam

# To convert sam to fasta
for samFile in /sam/*.sam
do
  datafunk sam_2_fasta -s ${samFile} -r wuhan-reference.fasta -o ${samFile}.fasta --pad
done

# # To filter fastas
# datafunk filter_fasta_by_covg_and_length  -i align/sample.fasta -o sample_filtered.fasta --min-covg 90

# Then concatenate
cat /sam/*.fasta > all-aligned.fasta

# Build Tree
FastTreeMP -gtr -nosupport -nt all-aligned.fasta > output.tree #2> log

# Root tree
# clusterfunk root --in-format newick -i output.tree --out-format newick -o rooted-tree.nwk
cp output.tree rooted-tree.nwk

cat rooted-tree.nwk | node newick-to-json.js
