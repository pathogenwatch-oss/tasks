#!/usr/bin/env bash

set -e

for file in $1/*.fasta
do
  if [ ! -f $1/$(basename $file).core.json ]; then
    echo $file
    cat $file | \
      docker run -i --rm \
        -e WGSA_ORGANISM_TAXID=1280 \
        -e WGSA_FILE_ID=`shasum $file | cut -d ' ' -f 1` \
        registry.gitlab.com/cgps/wgsa-tasks/core:v1 > $1/$(basename $file).core.json
  fi
done
