#!/usr/bin/env bash

version="v2.1.7_2021-01-20_R2"

docker pull registry.gitlab.com/cgps/cog-uk/pangolin:${version}

docker tag registry.gitlab.com/cgps/cog-uk/pangolin:${version} registry.gitlab.com/cgps/pathogenwatch-tasks/pangolin:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/pangolin:${version}
