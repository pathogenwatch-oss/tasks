#!/bin/bash

task=$1
tag=$2

cd $task
docker build -t registry.gitlab.com/cgps/pathogenwatch-tasks/$task:$tag .
docker push registry.gitlab.com/cgps/pathogenwatch-tasks/$task:$tag
cd ..
