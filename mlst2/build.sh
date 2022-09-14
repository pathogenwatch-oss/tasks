#!/bin/bash

VERSION=202209111732-v3.2.0

cd ../mlst
docker build \
  --build-arg BASE="mlst2:$VERSION" \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION
