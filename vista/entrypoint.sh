#!/usr/bin/env bash

cat - > /tmp/sequence.fa

python3 vista.py search /tmp/sequence.fa
