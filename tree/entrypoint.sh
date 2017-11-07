#!/usr/bin/env sh

set -e

cd /wgsa

node /wgsa/input.js

cd /data

/tree_pipeline.sh -s $WGSA_ORGANISM_TAXID -i . > /dev/null

echo { \"tree\": \"$(cat wgsa.nwk)\", \"matrix\": \"$(cat result.mldist)\" }
