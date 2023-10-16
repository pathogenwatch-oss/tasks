#!/bin/sh

cat - > /tmp/input.fasta

#SeqSero2_package.py -m k -t 4 -i /tmp/input.fasta | python /opt/pathogenwatch/formatter.py
python -m resfinder -o resfinder_out --species ${SCHEME} --acquired --point --disinfectant -ifa /tmp/input.fasta >/dev/null 2>/dev/null

python /resfinder_formatter.py ${SCHEME}