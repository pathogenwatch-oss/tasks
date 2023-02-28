#!/usr/bin/env bash

set -euo pipefail

AMRSEARCH_VERSION=${1:-v3.0.12}
PW_VERSION=${2:-${AMRSEARCH_VERSION}}


docker build --rm --build-arg VERSION="${AMRSEARCH_VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/paarsnp:"${PW_VERSION}" .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/paarsnp:"${PW_VERSION}"