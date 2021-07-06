# GHRU Assembly Pipeline

This pipeline is based on https://gitlab.com/cgps/ghru/pipelines/dsl2/pipelines/assembly.  It runs Nextflow within a docker container.

## Versions

Version | Nextflow Version | Pipeline Version
-|-|-
v0 | 21.04.1 | 2.1.0

## Building

```
./build.sh
```

## Testing

```
tar c -C /example/little_reads/ ERR2172265_1.fastq.gz ERR2172265_2.fastq.gz | \
  docker run -i --rm registry.gitlab.com/cgps/pathogenwatch-tasks/assembly:$VERSION > \
  output.fa
```