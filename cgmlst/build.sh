#!/bin/bash

VERSION=202207221247-v3.0.4

cd ../mlst
docker build \
  --build-arg BASE=cgmlst-$VERSION \
  --build-arg TASK=cgmlst \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION
