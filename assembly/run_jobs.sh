#!/usr/bin/env bash

set -eu -o pipefail

for file1 in *R1.fq.gz
do
  echo "${file1}"
  file2=${file1/R1.fq.gz/R2.fq.gz}
  base=${file1/_R1.fq.gz/}
  if [ -f "${base}.fasta.gz" ]
  then
    echo "Assembly exists, continuing."
    continue
  fi
  echo "${base}"
  docker run --rm -v "${PWD}":/working registry.gitlab.com/cgps/pathogenwatch-tasks/assembly:etoki-pathsafe ${file1} ${file2}
  mv EToKi_spades.fasta "${base}".fasta
  gzip "${base}".fasta
  mv result.json "${base}".json
done