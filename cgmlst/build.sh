#!/bin/bash

VERSION=202011162032-v2.6.3

cd ../mlst
docker build \
  --build-arg BASE=cgmlst-$VERSION \
  --build-arg TASK=cgmlst \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION .
