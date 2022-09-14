#!/bin/bash

VERSION=202209111732-v3.2.0

cd ../mlst
docker build \
  --build-arg BASE="cgmlst:$VERSION" \
  --build-arg TASK=cgmlst \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION
