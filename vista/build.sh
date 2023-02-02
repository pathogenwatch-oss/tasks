#!/usr/bin/env bash

set -euo pipefail

VISTA_VERSION=${1:-v1}
PW_VERSION=${2:-${VISTA_VERSION}}

docker build --build-arg VERSION="${VISTA_VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/vista:"${PW_VERSION}" .

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/vista:"${PW_VERSION}"