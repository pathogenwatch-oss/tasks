#!/bin/bash

set -eu -o pipefail

VERSION=v2

docker build \
  --build-arg NF_VERSION=21.04.1 \
  --build-arg PIPELINE_VERSION=2.1.0 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/assembly:$VERSION .
