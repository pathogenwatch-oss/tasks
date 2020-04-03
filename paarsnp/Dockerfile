FROM node:8-slim as node

FROM registry.gitlab.com/cgps/cgps-paarsnp:v2.2.2

COPY --from=node /usr/local/bin/node /usr/local/bin/node

COPY formatter.js /wgsa/formatter.js

COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT ["/wgsa/entrypoint.sh"]
