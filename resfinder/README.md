# Resfinder/Rfplus integration

## Quick start

The standard `Dockerfile` builds a version of Resfinder with the sanitised output for integration into Pathogenwatch.
To build an `rfplus` version, run the second Dockerfile in the `rfplus` directory (from within that directory).

```
docker build --pull --rm --build-arg SCHEME="salmonella" --build-arg SCHEME_NAME="salmonella" --build-arg VERSION="4.3.3" -t registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:4.3.3-salmonella .
cd rfplus
docker build --pull --rm --build-arg SCHEME="salmonella" --build-arg VERSION="4.3.3-salmonella" -t registry.gitlab.com/cgps/pathogenwatch-tasks/rfplus:0.0.3-salmonella .
```

If there isn't a specific scheme in Resfinder (e.g Listeria) use `other`.
```
docker build --pull --rm --build-arg SCHEME="other" --build-arg VERSION="4.6.0" -t registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:4.6.0-other .
```

As usual the images are run by piping in a FASTA.

```
xzcat my_ecoli_genome.fasta.xz | docker --rm -i  registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:4.6.0-ecoli > output.json
```

## Supported species

| Species            | SCHEME                 | SCHEME_NAME      |
|--------------------|------------------------|------------------|
| _E. coli_          | ecoli                  | escherichia_coli |
| _L. monocytogenes_ | listeria monocytogenes |                  |
| _S. enterica_      | salmonella             | salmonella       |

