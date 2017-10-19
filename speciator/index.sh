#!/bin/sh

cat - > /tmp/input.fasta
node index.js /tmp/input.fasta
