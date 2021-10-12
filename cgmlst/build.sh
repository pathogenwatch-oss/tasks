#!/bin/bash

VERSION=202110111604-v2.9.2

cd ../mlst
docker build \
  --build-arg BASE=cgmlst-$VERSION \
  --build-arg TASK=cgmlst \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION .
