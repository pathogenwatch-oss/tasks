# Produces the smallest image, but may only reliably build SISTR v1.1.2

FROM python:3.6-slim

ARG BLAST_VERSION=2.12.0

ENV BLAST_VERSION ${BLAST_VERSION}

CMD ["bash"]

RUN apt update && \
    apt install -y --no-install-recommends mafft curl && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

RUN echo "Using BLAST version: ${BLAST_VERSION}" && \
    mkdir -p /tmp/blast && \
    mkdir /opt/blast && \
    curl ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/${BLAST_VERSION}/ncbi-blast-${BLAST_VERSION}+-x64-linux.tar.gz | tar -zxC /tmp/blast --strip-components=1 && \
    cd /tmp/blast/bin && \
    mv blastn makeblastdb /opt/blast/ && \
    cd .. && \
    rm -rf /tmp/blast

ENV PATH /opt/blast:$PATH

# Known essential ones are: libcurl4-openssl-dev, libssl-dev
RUN /bin/sh -c set -ex; apt-get update; apt-get install -y --no-install-recommends \
    autoconf  \
    automake  \
    g++ \
    gcc \
    libc6-dev \
    libcurl4-openssl-dev \
    libgmp-dev \
    libssl-dev \
    make; \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade --no-cache-dir pip &&  \
    pip install --no-cache-dir sistr_cmd && \
    pip cache purge

COPY jq-linux64 /opt/pathogenwatch/

COPY index.sh /opt/pathogenwatch/

CMD [ "sh", "/opt/pathogenwatch/index.sh"]
