#!/bin/sh

cat - > /tmp/input.fasta

sistr --qc /tmp/input.fasta 2> /dev/null | \
  /opt/pathogenwatch/jq-linux64 '{ value: .[0].serovar, subspecies: .[0].cgmlst_subspecies, source: "SISTR" }'
