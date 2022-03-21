#!/bin/bash

VERSION=202203170958-v3.0.0

cd ../mlst
docker build \
  --build-arg BASE=alternative-mlst-$VERSION \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION
