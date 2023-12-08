#!/bin/bash
set -ueo pipefail

VERSION=${1:-231208-v5.3.0}

cd ../mlst || exit
./build.sh ngstar "${VERSION}"
cd - || exit
