#!/usr/bin/env bash

cat - > /tmp/sequence.fa

java -jar /paarsnp/paarsnp.jar -i /tmp/sequence.fa -s ${PW_ORGANISM_TAXID} -s ${PW_SPECIES_TAXID} -s ${PW_GENUS_TAXID} -o
