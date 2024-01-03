ARG VERSION=4.4.2

FROM genomicepidemiology/resfinder:${VERSION}

RUN apt update && \
    apt install -y curl && \
    rm -rf /var/lib/apt/lists && \
    pip install --no-cache-dir typer && \
    pip cache purge

COPY entrypoint.sh /

COPY output_model.py resfinder_formatter.py /

RUN chmod +x /entrypoint.sh

ARG SCHEME=salmonella
ENV SCHEME=${SCHEME}

#CMD ["python", "-m", "resfinder", "-o", "resfinder_out", "--acquired", "--point", "--disinfectant", "-ifa"]
ENTRYPOINT ["/entrypoint.sh"]