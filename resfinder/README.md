# About
The standard `Dockerfile` builds a version of Resfinder with the sanitised output for integration into Pathogenwatch.
To build an `rfplus` version, run the second Dockerfile.

```
docker build --pull --rm -t registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:4.3.3-salmonella .
cd rfplus
docker build --pull --rm -t registry.gitlab.com/cgps/pathogenwatch-tasks/rfplus:0.0.1-salmonella .
```
