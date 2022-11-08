#!/bin/bash

VERSION=${1:-v1.0.0-11}

docker pull registry.gitlab.com/cgps/pathogenwatch/analyses/klebsiella-lincodes:"${VERSION}"

docker tag registry.gitlab.com/cgps/pathogenwatch/analyses/klebsiella-lincodes:"${VERSION}" registry.gitlab.com/cgps/pathogenwatch-tasks/klebsiella-lincodes:"${VERSION}"

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/klebsiella-lincodes:"${VERSION}"
