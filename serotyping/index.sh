#!/bin/sh

cat - > /tmp/input.fasta

/NGStools/miniconda3/bin/sistr --qc -vv -f json -o /tmp/sistr-output /tmp/input.fasta > /tmp/sistr.log

cat /tmp/sistr-output.json | /opt/wgsa/jq-linux64 '{ serovar: .[0].serovar }'
