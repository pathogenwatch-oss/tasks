#!/usr/bin/env sh

FASTA_DIR=$1
BASE_CORE_VERSION=$2
ORGANISM_TAXID=$3

TEST_VERSION=test
FASTA_SUFFIX='.fasta'
NUM_PROCS=8

if [ -z "$BASE_CORE_VERSION" ]; then
    BUILD_ARGS_C=""
    BUILD_ARGS_T=""
else
    BUILD_ARGS_C="--build-arg BASE=${BASE_CORE_VERSION}"
    BUILD_ARGS_T="--build-arg CORE=${TEST_VERSION}"
fi

echo "${BUILD_ARGS_C}"
echo "${BUILD_ARGS_T}"

cd core
docker build \
  ${BUILD_ARGS_C} \
  -t registry.gitlab.com/cgps/wgsa-tasks/core:${TEST_VERSION} .
cd ..

cd tree
docker build \
  ${BUILD_ARGS_T} \
  -t registry.gitlab.com/cgps/wgsa-tasks/tree:${TEST_VERSION} .

mkdir /tmp/inputs

echo "Generating cores"

find ${FASTA_DIR} -maxdepth 1 -name "*${FASTA_SUFFIX}" -print0 | xargs -0 -I infile -P ${NUM_PROCS} sh -c 'echo "assembly: $1, organism: $2, version:$3, fasta suffix: $4" && cat "$1" | docker run --rm -i -e WGSA_ORGANISM_TAXID="$2" registry.gitlab.com/cgps/wgsa-tasks/core:"$3" > /tmp/inputs/$(basename "$1" "$4").json' -- infile ${ORGANISM_TAXID} ${BASE_CORE_VERSION} ${FASTA_SUFFIX}

CORES=$(ls /tmp/inputs/*.json)

node create-bson-tree-input.js ${CORES} > /tmp/input.bson

rm -rf /tmp/inputs

cat /tmp/input.bson | docker run --rm -i \
  -e WGSA_ORGANISM_TAXID=${ORGANISM_TAXID} \
  registry.gitlab.com/cgps/wgsa-tasks/tree:${TEST_VERSION} | tail -n 1 > tc_output.json

node replace_ids.js ids.json tc_output.json

rm -f input.bson