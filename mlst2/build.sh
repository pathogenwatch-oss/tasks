#!/bin/bash

VERSION=202003121126-v2.3.2

cd ../mlst
docker build \
  --build-arg BASE=alternative-mlst-$VERSION \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .
