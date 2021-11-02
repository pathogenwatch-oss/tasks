version="v1.1.0"

docker pull registry.gitlab.com/cgps/pathogenwatch/analyses/poppunk2:${version}

docker tag registry.gitlab.com/cgps/pathogenwatch/analyses/poppunk2:${version} registry.gitlab.com/cgps/pathogenwatch-tasks/poppunk2:${version} \
  && docker push registry.gitlab.com/cgps/pathogenwatch-tasks/poppunk2:${version}