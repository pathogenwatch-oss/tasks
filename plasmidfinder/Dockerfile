ARG VERSION=2.1.6_2025-02-19

FROM staphb/plasmidfinder:${VERSION}

ARG SCHEME=gram_positive
ARG SANITISER_VERSION=4

ENV SCHEME=${SCHEME}
ENV SANITISER_VERSION=${SANITISER_VERSION}

RUN apt update && \
    apt install -y --no-install-recommends curl python3-pip && \
    pip3 install --no-cache-dir more_itertools && \
    curl -L -o /usr/local/bin/sanitiser "https://github.com/CorinYeatsCGPS/sanitise-fasta/releases/download/${SANITISER_VERSION}/sanitiser" && \
    chmod +x /usr/local/bin/sanitiser && \
    apt remove -y python3-pip && \
    apt autoremove -y && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /root/.cache /usr/local/lib/python*/dist-packages/pip* /usr/local/lib/python*/dist-packages/setuptools*

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY wrapper.py /wrapper.py
COPY config.json /config.json
COPY ${SCHEME}_tax.json /${SCHEME}_tax.json

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    mkdir -p /output

WORKDIR /output

ENTRYPOINT ["entrypoint.sh"]