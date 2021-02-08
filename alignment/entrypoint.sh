#!/usr/bin/env bash

set -e -o pipefail

minimap2 -a -x asm5 /wuhan-reference.fasta - | \
  datafunk sam_2_fasta -s - -r /wuhan-reference.fasta --pad |  \
  node /formatter.js
