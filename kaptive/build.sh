#!/usr/bin/env bash

set -euo pipefail
set -x

KAPTIVE_VERSION=${1:-3.0.0b5}
RUNNER_VERSION=${2:-3}

for i in kpsc ab
do
  IMAGE_NAME=registry.gitlab.com/cgps/pathogenwatch-tasks/kaptive:"${i}"-v"${KAPTIVE_VERSION}"-"${RUNNER_VERSION}"
  docker build --target prod --rm --build-arg KAPTIVE_VERSION="${KAPTIVE_VERSION}" --build-arg SPECIES=${i} -t "${IMAGE_NAME}" .
  docker push "${IMAGE_NAME}"
done
