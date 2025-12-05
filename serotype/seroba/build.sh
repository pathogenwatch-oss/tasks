#!/usr/bin/env bash

set -euo pipefail

VERSION=${1:-""}
push=${2:-false}

if [ -z "$VERSION" ]; then
  echo "Error: Version number is required. e.g. '2.0.5'. Add 'true' as the second argument to push the image to GitLab."
  exit 1
fi

echo "Building Seroba Docker image for version ${VERSION}"

docker build -t "registry.gitlab.com/cgps/pathogenwatch-tasks/serotype:seroba-v${VERSION}" --build-arg VERSION="${VERSION}" .

if [ "$push" = "true" ]; then
  docker push "registry.gitlab.com/cgps/pathogenwatch-tasks/serotype:seroba-v${VERSION}"
fi
