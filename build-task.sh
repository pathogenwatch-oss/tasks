#!/bin/bash

task=$1
tag=$2

cd $task
docker build -t registry.gitlab.com/cgps/wgsa-tasks/$tag .
docker push registry.gitlab.com/cgps/wgsa-tasks/$tag
cd ..
