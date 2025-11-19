FROM registry.gitlab.com/cgps/pathogenwatch/ngono-markers:v0.1.0

RUN apt update && \
    apt install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
