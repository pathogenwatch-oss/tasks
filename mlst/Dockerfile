ARG BASE
FROM registry.gitlab.com/cgps/cgps-mlst/${BASE}

ARG TASK
ENV PW_TASK ${TASK:-mlst}

COPY formatter.js /pathogenwatch/formatter.js
COPY entrypoint.sh /pathogenwatch/entrypoint.sh

ENTRYPOINT []
CMD [ "/pathogenwatch/entrypoint.sh" ]
