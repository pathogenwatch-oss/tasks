#!/usr/bin/env sh

set -e

mkdir -p /data

cd /wgsa

cat - | node /wgsa/input.js

cd /data

/tree_pipeline.sh -s $WGSA_ORGANISM_TAXID -i .

echo { \"tree\": \"$(cat wgsa.nwk)\" }
# cat /data/5a009f2d5d851d772e25483a_core.jsn
