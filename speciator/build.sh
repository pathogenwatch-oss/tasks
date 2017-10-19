#!/usr/bin/env bash

version=v1

docker build -t registry.gitlab.com/cgps/wgsa-tasks/speciator:$version .

if [[ $1 = "push" ]]
then
  docker push registry.gitlab.com/cgps/wgsa-tasks/speciator:$version
fi
