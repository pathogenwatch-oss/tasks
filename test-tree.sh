#!/usr/bin/env sh

BASE_CORE_VERSION=$1
FASTA_DIR=$2
ORGANISM_TAXID=$3

TEST_VERSION=test
FASTA_SUFFIX='.fasta'

cd core
docker build \
  --build-arg BASE=$BASE_CORE_VERSION \
  -t registry.gitlab.com/cgps/wgsa-tasks/core:$TEST_VERSION .
cd ..

cd tree
docker build \
  --build-arg CORE=$TEST_VERSION \
  -t registry.gitlab.com/cgps/wgsa-tasks/tree:$TEST_VERSION .

mkdir -p inputs

for FILE in $(ls $FASTA_DIR/*$FASTA_SUFFIX)
do
  cat $FILE | docker run -i \
    -e WGSA_ORGANISM_TAXID=$ORGANISM_TAXID \
    registry.gitlab.com/cgps/wgsa-tasks/core:$TEST_VERSION > inputs/$(basename -s $FASTA_SUFFIX $FILE).json
done

CORES=$(ls inputs/*.json)

node create-bson-tree-input.js $CORES > input.bson
rm -rf inputs

cat input.bson | docker run -i \
  -e WGSA_ORGANISM_TAXID=$ORGANISM_TAXID \
  registry.gitlab.com/cgps/wgsa-tasks/tree:$TEST_VERSION | tail -n 1 > output.json

node replace_ids.js ids.json output.json
