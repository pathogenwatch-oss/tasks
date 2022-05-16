#!/usr/bin/env bash

if [ "$#" -ne 1 ]; then
    echo "./build.sh [version e.g. v2.0.0] [species e.g. 1463165]"
fi

VERSION=${1}
SPECIES=${2}

docker build --rm --build-arg species="${SPECIES}" --build-arg VERSION="${VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/core:${VERSION}-${SPECIES} .
