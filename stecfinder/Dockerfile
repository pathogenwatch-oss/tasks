ARG VERSION=1.1.2--pyhdfd78af_0

FROM quay.io/biocontainers/stecfinder:${VERSION}

COPY read_results.py entrypoint.sh /pathogenwatch/

WORKDIR /pathogenwatch

ARG VERSION_LABEL=${VERSION}
ENV VERSION=${VERSION_LABEL}

ENTRYPOINT /pathogenwatch/entrypoint.sh "${VERSION}"