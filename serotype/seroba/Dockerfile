
ARG VERSION=2.0.5

FROM sangerbentleygroup/seroba:${VERSION}

LABEL authors="Anthony Underwood & Corin Yeats" \
      description="Docker image containing all requirements for seroba analysis"

RUN apt --allow-releaseinfo-change update \
    && apt install -y make g++ gcc zlib1g-dev git curl libcurl4-openssl-dev libbz2-dev liblzma-dev \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/samtools/htslib.git && \
    cd htslib && \
    git submodule update --init --recursive && \
    make && \
    cd .. && \
    git clone https://github.com/RAHenriksen/NGSNGS.git && \
    cd NGSNGS && \
    make HTSSRC=../htslib && \
    cp ngsngs /usr/local/bin/ngsngs && \
    cd .. && \
    rm -rf htslib NGSNGS

COPY run_seroba.sh /root/bin/run_seroba.sh

ENTRYPOINT ["/root/bin/run_seroba.sh"]
