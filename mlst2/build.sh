#!/bin/bash

VERSION=${1:-'231208-v5.3.0'}

cd ../mlst
docker build \
  --build-arg BASE="mlst2:$VERSION" \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION
