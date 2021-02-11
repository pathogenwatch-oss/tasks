#!/usr/bin/env sh

set -e

# concatenate input
node /save-files.js | \
# Build Tree
cat wuhan-reference.fasta - | FastTree -gtr -nosupport -nt | \
# Root tree
python prune-tree.py | \
# to json
jq --raw-input --slurp --compact-output '{ newick: .  }'
