#!/usr/bin/env bash

version="v2.2.1"

docker pull registry.gitlab.com/cgps/cgps-kleborate:${version}

docker tag registry.gitlab.com/cgps/cgps-kleborate:${version} registry.gitlab.com/cgps/pathogenwatch-tasks/kleborate:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/kleborate:${version}
