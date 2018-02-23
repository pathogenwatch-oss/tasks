#!/usr/bin/env bash

set -e

cat - > /tmp/${WGSA_FILE_ID}.fasta

node /usr/local/cgps-core-fp/index.js query /tmp/${WGSA_FILE_ID}.fasta
