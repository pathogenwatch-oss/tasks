#!/bin/bash

TASK=${1:-mlst}
VERSION=${2:-202004091529-v2.4.0}

docker build \
  --build-arg BASE=$TASK-$VERSION \
  --build-arg TASK=$TASK \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION .
