#!/usr/bin/env sh

set -e

node /wgsa/build-matrix.js

/usr/bin/Rscript --vanilla /wgsa/create-tree.r matrix.csv tree.nwk

echo { \"tree\": \"$(cat tree.nwk)\" }
