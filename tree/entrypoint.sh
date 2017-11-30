#!/usr/bin/env sh

kernel=1755637
workers=${WGSA_WORKERS:-1}

/wgsa/build-matrix -workers=$workers -kernel=$kernel &&\
  /usr/bin/Rscript --vanilla /wgsa/create-tree.r matrix.csv
