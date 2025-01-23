# Rfplus manual
## Quick start
```
docker build --progress plain --rm --build-arg SCHEME="listeria monocytogenes" --build-arg VERSION="4.6.0-other" -t registry.gitlab.com/cgps/pathogenwatch-tasks/rfplus:4.6.0-lmonocytogenes .
docker build --pull --rm --build-arg SCHEME="salmonella" --build-arg VERSION="4.3.3-salmonella" -t registry.gitlab.com/cgps/pathogenwatch-tasks/rfplus:0.0.3-salmonella .
```
