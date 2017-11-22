#!/usr/bin/env sh

set -e

time /usr/local/bin/node /wgsa/build-matrix.js 

time /usr/bin/Rscript --vanilla /wgsa/create-tree.r matrix.csv
