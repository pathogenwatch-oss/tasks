#!/usr/bin/env bash

set -e

for file in $1/*.fasta
do
  mkdir -p $2
  corefp=$2/$(basename $file .fasta).json
  if [ ! -f $corefp ]; then
    echo $file $(basename $file)
    docker run \
      --rm \
      -v $1:/data \
      registry.gitlab.com/cgps/wgsa-test-images/core-fp:0.0.12 -s 1280 -i $(basename $file) > $corefp
  fi
done
