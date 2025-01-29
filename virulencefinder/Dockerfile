ARG VERSION=3.1.0
FROM virulencefinder:${VERSION}

COPY entrypoint.sh virulencefinder_formatter.py /pathogenwatch/

WORKDIR /pathogenwatch

ARG SCHEME=virulence_ecoli
ENV SCHEME=${SCHEME}

ENTRYPOINT ["./entrypoint.sh"]