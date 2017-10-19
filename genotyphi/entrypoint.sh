#!/usr/bin/env bash

cat - > /tmp/sequence.fa

java -jar /genotyphi/genotyphi.jar -i /tmp/sequence.fa -o -f simple_json | /wgsa/formatter
