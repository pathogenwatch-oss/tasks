FROM python:3.11-slim AS kaptive
ARG KAPTIVE_VERSION=3.1.0

ENV PYTHONDONTWRITEBYTECODE=1

RUN apt update && \
    apt install -y --no-install-recommends curl bzip2 &&  \
    rm -rf /var/lib/apt/lists/*

RUN curl -L "https://github.com/lh3/minimap2/releases/download/v2.28/minimap2-2.28_x64-linux.tar.bz2" | tar -jxvf - && \
    mv minimap2-2.28_x64-linux/minimap2 /usr/local/bin/ && \
    rm -rf minimap2-2.28_x64-linux

#RUN pip --no-cache-dir install dna_features_viewer kaptive==${KAPTIVE_VERSION}
RUN pip --no-cache-dir install kaptive==${KAPTIVE_VERSION}

ENTRYPOINT ["kaptive"]

FROM kaptive AS dev

ENV PYTHONDONTWRITEBYTECODE=1

RUN pip --disable-pip-version-check --no-cache-dir install click

FROM dev AS prod

# "kpsc" or "ab"
ARG SPECIES=kpsc
ENV SPECIES=${SPECIES}

RUN mkdir /Kaptive

COPY kaptive-runner.py /Kaptive/kaptive-runner.py

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT sh /entrypoint.sh ${SPECIES}
