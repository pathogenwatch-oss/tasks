#!/bin/bash

tag=t1

for dir in */; do
  task=$(basename $dir)
  if [ "$task" != "node_modules" ]
  then
    cd $task
    docker build -t registry.gitlab.com/cgps/wgsa-tasks/$task:$tag .
    docker push registry.gitlab.com/cgps/wgsa-tasks/$task:$tag
    cd ..
  fi
done
