#!/usr/bin/env bash

set -eu -o pipefail

if [ "$#" -ne 2 ]; then
    echo "./build.sh [version e.g. v2.0.0] [species e.g. 1463165]"
    exit 1
fi

VERSION=${1}
SPECIES=${2}

docker build --rm --build-arg SPECIES="${SPECIES}" --build-arg BASE="${VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/core:${VERSION}-${SPECIES} .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/core:${VERSION}-${SPECIES}
