#!/usr/bin/env bash

cat - > /tmp/sequence.fa

java -jar /paarsnp/paarsnp.jar -i /tmp/sequence.fa -s $WGSA_ORGANISM_TAXID -o | /usr/local/bin/node /wgsa/formatter.js
