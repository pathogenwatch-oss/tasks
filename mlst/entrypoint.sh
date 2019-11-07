/usr/local/bin/node --max-old-space-size=4096 /usr/local/mlst/index.js | \
  /usr/local/bin/node /pathogenwatch/formatter.js "$PW_SPECIES_TAXID" "$PW_TASK"
