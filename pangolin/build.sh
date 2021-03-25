#!/usr/bin/env bash

version="v2.3.5"

docker pull registry.gitlab.com/cgps/cog-uk/pangolin:${version}

docker tag registry.gitlab.com/cgps/cog-uk/pangolin:${version} registry.gitlab.com/cgps/pathogenwatch-tasks/pangolin:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/pangolin:${version}
