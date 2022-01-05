#!/bin/sh

cat - > /tmp/input.fasta

sistr --qc /tmp/input.fasta | \
  /opt/pathogenwatch/jq-linux64 '{ value: .[0].serovar, subspecies: .[0].cgmlst_subspecies, source: "SISTR" }'
