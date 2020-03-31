#!/bin/bash

VERSION=202003121120-v2.3.2

cd ../mlst
docker build \
  --build-arg BASE=cgmlst-$VERSION \
  --build-arg TASK=cgmlst \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION .
