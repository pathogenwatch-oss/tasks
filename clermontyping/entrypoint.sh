#!/usr/bin/env bash
set -e

cat - > /tmp/sequence.fa

$PWD/clermonTyping.sh --name pw --fasta /tmp/sequence.fa > /dev/null 2>&1

python3 $PWD/convert_output.py pw/pw_phylogroups.txt