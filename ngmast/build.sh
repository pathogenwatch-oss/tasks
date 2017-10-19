#!/usr/bin/env bash

docker build -t registry.gitlab.com/cgps/wgsa-tasks/ngmast:v1 .
docker push registry.gitlab.com/cgps/wgsa-tasks/ngmast:v1
