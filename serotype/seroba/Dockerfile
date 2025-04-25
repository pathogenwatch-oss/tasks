FROM registry.gitlab.com/cgps/pathogenwatch/analyses/seroba:v2.0.4

RUN apt update && \
    apt install -y --no-install-recommends curl && \
    apt clean && \
    rm -rf /var/cache/apt/archives /var/lib/apt/lists/*

COPY entrypoint.sh /pathogenwatch/entrypoint.sh

ENTRYPOINT ["/pathogenwatch/entrypoint.sh"]