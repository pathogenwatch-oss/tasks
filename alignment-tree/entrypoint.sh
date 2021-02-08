#!/usr/bin/env sh

set -e

# concatenate input
node /save-files.js > all-aligned.fasta

# Build Tree
FastTree -gtr -nosupport -nt all-aligned.fasta > output.tree #2> log

# Root tree
# clusterfunk root --in-format newick -i output.tree --out-format newick -o tree.nwk
mv output.tree tree.nwk

cat tree.nwk | node newick-to-json.js
