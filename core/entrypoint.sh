#!/usr/bin/env bash

set -e

cat - > /data/${WGSA_FILE_ID}.fasta

java -jar /core/core-fp.jar -i /data/${WGSA_FILE_ID}.fasta -s $WGSA_ORGANISM_TAXID | /usr/local/bin/node /wgsa/formatter.js
