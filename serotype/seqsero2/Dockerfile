ARG VERSION=1.2.1

FROM staphb/seqsero2:${VERSION}

RUN apt update && \
    apt install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists

COPY index.sh /opt/pathogenwatch/

COPY formatter.py /opt/pathogenwatch/

CMD [ "sh", "/opt/pathogenwatch/index.sh"]

