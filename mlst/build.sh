#!/bin/bash

TASK=${1:-mlst}
VERSION=${2:-202209111732-v3.2.0}

docker build \
  --build-arg BASE="$TASK:$VERSION" \
  --build-arg TASK=$TASK \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION
