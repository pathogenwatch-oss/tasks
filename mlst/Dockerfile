ARG BASE=mlst-202003121126-v2.3.1
FROM registry.gitlab.com/cgps/cgps-mlst:${BASE}

ARG TASK
ENV PW_TASK ${TASK:-mlst}

COPY formatter.js /pathogenwatch/formatter.js
COPY entrypoint.sh /pathogenwatch/entrypoint.sh

ENTRYPOINT []
CMD [ "/pathogenwatch/entrypoint.sh" ]
