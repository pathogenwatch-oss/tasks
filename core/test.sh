#!/usr/bin/env bash

set -e

for file in $1/fastas/*.fasta
do
  echo $file
  mkdir -p $1/cores
  if [ ! -f $1/cores/$(basename $file .fasta).json ]; then
    cat $file | \
      docker run -i --rm \
        -e WGSA_ORGANISM_TAXID=1280 \
        -e WGSA_FILE_ID=`shasum $file | cut -d ' ' -f 1` \
        registry.gitlab.com/cgps/wgsa-tasks/core:t9 > $1/cores/$(basename $file .fasta).json
  fi
  # mkdir -p $1/variance  
  # if [ ! -f $1/variance/$(basename $file .fasta).json ]; then
  #   if [ ! -f $1/variance/$(basename $file .fasta).bson ]; then
  #     node core-to-variance.js  $1/cores/$(basename $file .fasta).json  $1/variance/$(basename $file .fasta).json  $1/variance/$(basename $file .fasta).bson
  #   fi
  # fi
done
