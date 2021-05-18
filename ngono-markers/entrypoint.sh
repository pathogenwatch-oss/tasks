#!/usr/bin/env bash

cat - > /tmp/sequence.fa

python3 /ngono-markers.py --fasta=/tmp/sequence.fa --blast_db=/db
