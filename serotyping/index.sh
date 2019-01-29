#!/bin/sh

cat - > /tmp/input.fasta

/NGStools/miniconda3/bin/sistr --qc /tmp/input.fasta | /opt/pathogenwatch/jq-linux64 '{ serovar: .[0].serovar }'
