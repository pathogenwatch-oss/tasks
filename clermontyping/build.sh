#!/usr/bin/env bash

PW_VERSION=${1:-v1}

set -e

docker build --rm --pull -t registry.gitlab.com/cgps/pathogenwatch-tasks/clermontyping:${PW_VERSION} .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/clermontyping:${PW_VERSION}
