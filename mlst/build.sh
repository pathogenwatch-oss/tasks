#!/bin/bash

TASK=${1:-mlst}
VERSION=${2:-202214121127-v3.2.1}
APPEND=${3:-}

docker build \
  --build-arg BASE="$TASK:$VERSION" \
  --build-arg TASK=${TASK} \
  -t registry.gitlab.com/cgps/pathogenwatch-tasks/${TASK}:${VERSION} .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/${TASK}:${VERSION}${APPEND}
