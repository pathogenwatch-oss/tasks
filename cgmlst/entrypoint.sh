#!/usr/bin/env bash
set -e

/usr/local/bin/node --max-old-space-size=4096 /usr/local/mlst/index.js | /usr/local/bin/node /wgsa/formatter.js