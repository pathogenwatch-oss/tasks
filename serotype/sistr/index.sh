#!/bin/sh

cat - > /tmp/input.fasta

/NGStools/miniconda3/bin/sistr --qc /tmp/input.fasta | \
  /opt/pathogenwatch/jq-linux64 '{ value: .[0].serovar, subspecies: .[0].cgmlst_subspecies, source: "sistr" }'
