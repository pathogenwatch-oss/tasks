#!/bin/bash

set -e -o pipefail

/usr/local/bin/node --max-old-space-size=4096 /usr/local/mlst/index.js | \
  /usr/local/bin/node /pathogenwatch/formatter.js
