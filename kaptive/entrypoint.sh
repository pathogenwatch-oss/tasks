#!/usr/bin/env bash

cat - > /tmp/sequence.fa

python /Kaptive/kaptive-runner.py -f /tmp/sequence.fa
