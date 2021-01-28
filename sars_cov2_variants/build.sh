#!/usr/bin/env bash

version="0.0.8"

docker pull registry.gitlab.com/cgps/cog-uk/type_variants:${version}

docker tag registry.gitlab.com/cgps/cog-uk/type_variants:${version} registry.gitlab.com/cgps/pathogenwatch-tasks/sars_cov2_variants:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/sars_cov2_variants:${version}
