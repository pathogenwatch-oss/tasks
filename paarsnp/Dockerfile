FROM node:8-slim as node

FROM cgps/paarsnp:1.0.2

COPY --from=node /usr/local/bin/node /usr/local/bin/node

COPY formatter.js /wgsa/formatter.js

COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT ["/wgsa/entrypoint.sh"]
