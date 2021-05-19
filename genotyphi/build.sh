#!/usr/bin/env bash

docker build -t registry.gitlab.com/cgps/pathogenwatch-tasks/genotyphi:v3 . \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/genotyphi:v3
.
