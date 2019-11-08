#!/bin/bash

export ORGANISM_TAXID=$PW_ORGANISM_TAXID
export SPECIES_TAXID=$PW_SPECIES_TAXID
export GENUS_TAXID=$PW_GENUS_TAXID

/usr/local/bin/node --max-old-space-size=4096 /usr/local/mlst/index.js | \
  /usr/local/bin/node /pathogenwatch/formatter.js "$PW_SPECIES_TAXID" "$PW_TASK"
