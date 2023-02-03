#!/usr/bin/env bash

set -euo pipefail

AMRSEARCH_VERSION=${1:-v3.0.5}
PW_VERSION=${2:-${AMRSEARCH_VERSION}}


docker build --build-arg VERSION="${AMRSEARCH_VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/vista:"${PW_VERSION}" .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/vista:"${PW_VERSION}"