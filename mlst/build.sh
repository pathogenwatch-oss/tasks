#!/bin/bash

TASK=${1:-mlst}
VERSION=${2:-202203171422-v3.0.3}

docker build \
  --build-arg BASE=$TASK-$VERSION \
  --build-arg TASK=$TASK \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION
