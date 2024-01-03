ARG BASE
FROM registry.gitlab.com/cgps/cgps-mlst/${BASE}

ARG TASK
ENV PW_TASK ${TASK:-mlst}

RUN apt update && \
    apt install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists

COPY formatter.js /pathogenwatch/formatter.js
COPY entrypoint.sh /pathogenwatch/entrypoint.sh

# Test for singularity
#RUN chmod -R o+rX /usr/local/mlst/index_dir

ENTRYPOINT []
CMD [ "/pathogenwatch/entrypoint.sh" ]
