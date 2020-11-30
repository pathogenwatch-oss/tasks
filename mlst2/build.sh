#!/bin/bash

VERSION=202011162043-v2.6.3

cd ../mlst
docker build \
  --build-arg BASE=alternative-mlst-$VERSION \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .
