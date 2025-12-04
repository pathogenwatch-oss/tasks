# Build Instructions

This document provides instructions on how to build the `seroba` Docker image using the provided build script.

## Building the Image

To build the Docker image, run the `build.sh` script with a version number.

```bash
./build.sh <version>
```

For example:

```bash
./build.sh 2.0.5
```

## Building and Pushing the Image

To build the image and push it to the GitLab container registry, add true as the second argument.

```bash
./build.sh <version> true
```

For example:

```bash
./build.sh 2.0.5 true
```