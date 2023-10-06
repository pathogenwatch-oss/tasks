ARG VERSION=1.2.1

FROM staphb/seqsero2:${VERSION}

COPY index.sh /opt/pathogenwatch/

COPY formatter.py /opt/pathogenwatch/

CMD [ "sh", "/opt/pathogenwatch/index.sh"]

