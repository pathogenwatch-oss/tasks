#!/usr/bin/env bash

docker build -t registry.gitlab.com/cgps/wgsa-tasks/genotyphi:v2.0.3 . \
  && docker push registry.gitlab.com/cgps/wgsa-tasks/genotyphi:v2.0.3
