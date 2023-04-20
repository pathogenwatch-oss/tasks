#!/bin/bash

VERSION=${1:-2023041203-klebsiella_1-v3.2.1}

cd ../mlst || exit

docker build \
  --build-arg BASE="cgmlst:$VERSION" \
  --build-arg TASK=cgmlst \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst:$VERSION
