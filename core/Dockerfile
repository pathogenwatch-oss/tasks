ARG BASE
ARG SPECIES

FROM registry.gitlab.com/cgps/cgps-core-fp:${BASE}-${SPECIES}

COPY formatter.js /wgsa/formatter.js
COPY formatProfile.js /wgsa/formatProfile.js
COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT []

CMD ["/wgsa/entrypoint.sh"]
