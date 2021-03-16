#!/usr/bin/env bash

version="0.1.0"

docker pull registry.gitlab.com/cgps/cog-uk/type_variants:${version}

docker tag registry.gitlab.com/cgps/cog-uk/type_variants:${version} registry.gitlab.com/cgps/pathogenwatch-tasks/sarscov2-variants:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/sarscov2-variants:${version}
