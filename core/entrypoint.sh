#!/usr/bin/env bash

set -e

cat - > /data/sequence.fasta

java -jar /core-aligner.jar -i /data/sequence.fasta -s $WGSA_ORGANISM_TAXID \

cat /data/sequence_core.jsn
