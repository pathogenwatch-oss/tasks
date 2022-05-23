FROM python:3.9-slim
ENV TAG=master

RUN apt-get update && \
    apt-get -y install git ncbi-blast+ && \
    pip install biopython click && \
    rm -rf /var/lib/apt/lists/* && \
    git clone --depth 1 --branch "${TAG}" https://github.com/katholt/Kaptive && \
    cd /Kaptive && \
    rm -rf .git && \
    apt-get -y --purge remove git

COPY kaptive-runner.py /Kaptive/kaptive-runner.py

COPY entrypoint.sh /entrypoint.sh

WORKDIR /Kaptive

ENTRYPOINT ["sh", "/entrypoint.sh"]
