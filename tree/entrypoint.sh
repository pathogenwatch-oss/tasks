#!/usr/bin/env sh

kernel=`cat ${WGSA_ORGANISM_TAXID}_ks.jsn | /wgsa/get-kernel-size`
workers=${WGSA_WORKERS:-1}

/wgsa/build-matrix -workers=$workers -kernel=$kernel &&\
  /usr/bin/Rscript --vanilla /wgsa/create-tree.r matrix.csv
