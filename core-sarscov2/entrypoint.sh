#!/usr/bin/env bash

set -e -o pipefail

cat - > /sample.fasta

/usr/local/bin/minimap2 -a -x asm5 /wuhan-reference.fasta /sample.fasta | node /formatter.js
