#!/usr/bin/env bash

set -euo pipefail

KAPTIVE_VERSION=${1:-v2.0.5}
PW_VERSION=${2:-${KAPTIVE_VERSION}}


docker build --rm --build-arg TAG="${KAPTIVE_VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/kaptive:"${PW_VERSION}" .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/kaptive:"${PW_VERSION}"