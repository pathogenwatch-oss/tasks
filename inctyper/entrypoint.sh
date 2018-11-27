#!/usr/bin/env bash

cat - > /tmp/sequence.fa

python3 inc_typer.py /tmp/sequence.fa ${PW_GENUS_TAXID}
