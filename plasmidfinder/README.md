# Plasmidfinder wrapper for Pathogenwatch

## How to build images

1. Edit the [config.json](config.json).
2. Either edit the default version in the [Dockerfile](Dockerfile) or pass it as a build argument.
3. Build one image for each scheme using the commands below (but changing the tag as appropriate).

```
# Gram Positive: 
%> `docker build --rm --build-arg SCHEME="gram_positive" -t registry.gitlab.com/cgps/pathogenwatch-tasks/plasmidfinder:v1-gram_positive .`

# Enterobacteriales: `
%> docker build --rm --build-arg SCHEME="enterobacteriales" -t registry.gitlab.com/cgps/pathogenwatch-tasks/plasmidfinder:v1-enterobacteriales . `
```

## Bindings for PW

The current mappings of genus to image are in [mapping.txt](mapping.txt).