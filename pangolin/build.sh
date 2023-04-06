#!/usr/bin/env bash

version=${1:-"v19.3.0"}

docker pull registry.gitlab.com/cgps/cog-uk/pangolin:"${version}"

docker tag registry.gitlab.com/cgps/cog-uk/pangolin:"${version}" registry.gitlab.com/cgps/pathogenwatch-tasks/pangolin:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/pangolin:${version}
