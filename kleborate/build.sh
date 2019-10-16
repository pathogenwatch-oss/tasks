#!/usr/bin/env bash

version="v2.0.0"

docker pull registry.gitlab.com/cgps/cgps-kleborate:${version}

docker tag registry.gitlab.com/cgps/cgps-kleborate:${version} registry.gitlab.com/cgps/wgsa-tasks/kleborate:${version} \
  && docker push registry.gitlab.com/cgps/wgsa-tasks/kleborate:${version}
