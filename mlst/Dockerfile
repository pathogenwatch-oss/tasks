ARG BASE=mlst-201910211136-v2.0.5
FROM registry.gitlab.com/cgps/cgps-mlst:${BASE}

ARG TASK
ENV PW_TASK ${TASK:-mlst}

COPY formatter.js /pathogenwatch/formatter.js
COPY entrypoint.sh /pathogenwatch/entrypoint.sh

ENTRYPOINT [ ]
CMD [ "/pathogenwatch/entrypoint.sh" ]
