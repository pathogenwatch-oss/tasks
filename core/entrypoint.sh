#!/usr/bin/env bash

set -e

cat - > /tmp/${WGSA_FILE_ID}.fasta

/bin/bash /run.sh query /tmp/${WGSA_FILE_ID}.fasta | node /wgsa/formatter.js
