#!/bin/bash

VERSION=202109151247-v2.10.2

cd ../mlst
docker build \
  --build-arg BASE=alternative-mlst-$VERSION \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .
