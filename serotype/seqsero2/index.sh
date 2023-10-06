#!/bin/sh

cat - > /tmp/input.fasta

SeqSero2_package.py -m k -t 4 -i /tmp/input.fasta | python /opt/pathogenwatch/formatter.py
