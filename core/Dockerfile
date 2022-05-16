ARG BASE=v2.0.0-6
ARG SPECIES=1463165

FROM registry.gitlab.com/cgps/cgps-core-fp:${BASE}-${SPECIES}

COPY formatter.js /wgsa/formatter.js
COPY formatProfile.js /wgsa/formatProfile.js
COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT []

CMD ["/wgsa/entrypoint.sh"]
