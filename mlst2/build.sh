#!/bin/bash

VERSION=201910141355-v2.0.5

cd ../mlst
docker build \
  --build-arg BASE=alternative-mlst-$VERSION \
  --build-arg TASK=mlst2 \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/mlst2:$VERSION .
