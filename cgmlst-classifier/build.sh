#!/bin/bash

VERSION=1-13

docker pull registry.gitlab.com/cgps/pathogenwatch/cgmlst-classifier:${VERSION}

docker tag registry.gitlab.com/cgps/pathogenwatch/cgmlst-classifier:${VERSION} registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst-classifier:${VERSION}

docker push registry.gitlab.com/cgps/pathogenwatch-tasks/cgmlst-classifier:${VERSION}
