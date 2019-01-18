#!/usr/bin/env bash

cat - > /tmp/sequence.fa

java -jar /paarsnp/paarsnp.jar -i /tmp/sequence.fa -s ${PW_ORGANISM_TAXID} ${PW_SPECIES_TAXID} ${PW_GENUS_TAXID} -o | /usr/local/bin/node /wgsa/formatter.js
