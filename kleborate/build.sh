#!/usr/bin/env bash

kleborate_version="v2.3.0"
internal_version="v2.3.2"

docker pull registry.gitlab.com/cgps/cgps-kleborate:${kleborate_version}

docker tag registry.gitlab.com/cgps/cgps-kleborate:${kleborate_version} registry.gitlab.com/cgps/pathogenwatch-tasks/kleborate:${internal_version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/kleborate:${internal_version}
