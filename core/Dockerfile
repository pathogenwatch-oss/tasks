ARG BASE=v0.2.12

FROM registry.gitlab.com/cgps/cgps-core-fp:${BASE}

COPY formatter.js /wgsa/formatter.js
COPY formatProfile.js /wgsa/formatProfile.js
COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT []

CMD ["/wgsa/entrypoint.sh"]
