#!/usr/bin/env bash
set -eu

#SPECIES="${1:-kpsc}"

cat - | sed 's/\t//' | sed 's/ /_/g' | sed '/^$/d' > /tmp/sequence.fa

python /Kaptive/kaptive-runner.py -s "${1}" -f /tmp/sequence.fa
