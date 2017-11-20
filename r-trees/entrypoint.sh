#!/usr/bin/env sh

set -e

cat - > matrix.csv

cat matrix.csv | /usr/bin/Rscript --vanilla /wgsa/create-tree.r matrix.csv

