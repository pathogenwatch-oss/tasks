#!/bin/bash

TASK=${1:-mlst}
VERSION=${2:-202003121126-v2.3.1}

docker build \
  --build-arg BASE=$TASK-$VERSION \
  --build-arg TASK=$TASK \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/$TASK:$VERSION .
