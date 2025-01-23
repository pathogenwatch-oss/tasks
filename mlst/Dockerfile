ARG SOURCE_IMAGE

FROM ${SOURCE_IMAGE}

RUN apt update && \
    apt install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists

COPY formatter.js /pathogenwatch/formatter.js
COPY entrypoint.sh /pathogenwatch/entrypoint.sh

ENTRYPOINT []
CMD [ "/pathogenwatch/entrypoint.sh" ]
