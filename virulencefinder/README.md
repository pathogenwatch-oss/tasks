# VirulenceFinder

## Quick build

### Creating the virulencefinder image

```
# In another directory
git clone --branch 3.1.0 --depth 1 https://bitbucket.org/genomicepidemiology/virulencefinder.git
cd virulencefinder
docker build --rm -t registry.gitlab.com/cgps/pathogenwatch/analyses/virulencefinder:3.1.0 .
cd {here}
docker build --build-arg SCHEME=virulence_ecoli --rm -t registry.gitlab.com/cgps/pathogenwatch-tasks/virulencefinder:3.1.0-ecoli .
```

## Important notes

## Updating the versions

The virulencefinder versions are currently hard-coded into the wrapper script. This should be improved.

## Tested schemes

The follwoing

1. `virulence_ecoli`
2. `listeria`

