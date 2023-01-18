#!/usr/bin/env bash

VERSION=${1:-v20220118}

docker build --build-arg VERSION="${VERSION}" -t registry.gitlab.com/cgps/pathogenwatch-tasks/inctyper:"${VERSION}" . \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/inctyper:"${VERSION}"
