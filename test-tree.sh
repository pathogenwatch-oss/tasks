#!/usr/bin/env sh

BASE_CORE_VERSION=$1
FASTA_DIR=$2
TEST_VERSION=test

cd core
docker build \
  --build-arg base=$BASE_CORE_VERSION \
  -t registry.gitlab.com/cgps/wgsa-tasks/core:$TEST_VERSION .
cd ..

cd tree
docker build \
  --build-arg core=$TEST_VERSION \
  -t registry.gitlab.com/cgps/wgsa-tasks/tree:$TEST_VERSION .

# need to pass the list of filenames to the node script, not sure if this is right
FASTAS=$(ls $FASTA_DIR)
node create-bson-tree-input.js $FASTAS > input.bson

cat input.bson | docker run -i registry.gitlab.com/cgps/wgsa-tasks/tree:$TEST_VERSION > output.json

# TODO: run script to replace taxa in output.json with names from ids.json, print final newick