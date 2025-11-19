#!/usr/bin/env bash

cat - > /tmp/sequence.fa

uv run /ngono-markers.py /tmp/sequence.fa --blast-db /db
