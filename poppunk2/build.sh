#!/usr/bin/env bash
VERSION=${1:-"v1.1.0"}

docker pull registry.gitlab.com/cgps/pathogenwatch/analyses/poppunk2:${VERSION}

docker tag registry.gitlab.com/cgps/pathogenwatch/analyses/poppunk2:${VERSION} registry.gitlab.com/cgps/pathogenwatch-tasks/poppunk2:${VERSION} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/poppunk2:${VERSION}