#!/usr/bin/env sh

set -e

/usr/local/bin/node /wgsa/build-matrix.js 

/usr/bin/Rscript --vanilla /wgsa/create-tree.r matrix.csv
