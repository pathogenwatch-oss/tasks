FROM ubuntu:22.04 as source

ARG SOURCE_VERSION=master

ENV SOURCE_VERSION ${SOURCE_VERSION}

RUN apt update && \
    apt install -y -q --no-install-recommends ca-certificates curl git && \
    rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch ${SOURCE_VERSION} https://github.com/A-BN/ClermonTyping.git

FROM ubuntu:22.04
LABEL authors="corin.yeats@cgps.group"

ARG BLAST_VERSION=2.12.0

ENV BLAST_VERSION ${BLAST_VERSION}

RUN apt update && \
    apt install -y -q --no-install-recommends python3 python3-pip gnupg curl pandoc && \
    pip3 install biopython && \
    echo "Using BLAST version: ${BLAST_VERSION}" && \
	mkdir -p /tmp/blast && \
    mkdir /opt/blast \
    && curl ftp://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/${BLAST_VERSION}/ncbi-blast-${BLAST_VERSION}+-x64-linux.tar.gz | tar -zxC /tmp/blast --strip-components=1 \
    && cd /tmp/blast/bin \
    && mv blastn makeblastdb /opt/blast/ \
    && cd .. \
    && rm -rf /tmp/blast && \
    curl https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | gpg --dearmor -o /usr/share/keyrings/r-project.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/r-project.gpg] https://cloud.r-project.org/bin/linux/ubuntu jammy-cran40/" | tee -a /etc/apt/sources.list.d/r-project.list && \
	apt update && \
    apt install -y --no-install-recommends r-base r-cran-readr r-cran-dplyr r-cran-tidyr r-cran-stringr r-cran-knitr r-cran-markdown r-cran-rmarkdown && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir /clermontyping

COPY --from=source /ClermonTyping/bin /clermontyping/bin

COPY --from=source /ClermonTyping/data /clermontyping/data

COPY --from=source /ClermonTyping/clermonTyping.sh /ClermonTyping/LICENSE /ClermonTyping/README.md /clermontyping/

COPY entrypoint.sh convert_output.py /clermontyping/

RUN chmod +x /clermontyping/clermonTyping.sh && \
    chmod +x /clermontyping/entrypoint.sh

ENV PATH /opt/blast:$PATH

WORKDIR /clermontyping

ENTRYPOINT ["./entrypoint.sh"]