#!/usr/bin/env bash

docker build -t registry.gitlab.com/cgps/wgsa-tasks/kleborate:v0.9.0 . \
  && docker push registry.gitlab.com/cgps/wgsa-tasks/kleborate:v0.9.0
