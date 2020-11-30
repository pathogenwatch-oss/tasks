#!/bin/bash

TASK=${1:-mlst}
VERSION=${2:-202011162044-v2.6.3}

docker build \
  --build-arg BASE=$TASK-$VERSION \
  --build-arg TASK=$TASK \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION .
