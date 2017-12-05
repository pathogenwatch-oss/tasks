FROM node:8-slim as node

FROM registry.gitlab.com/cgps/wgsa-test-images/core-fp:0.0.9

COPY --from=node /usr/local/bin/node /usr/local/bin/node

COPY formatter.js /wgsa/formatter.js
COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT []

CMD ["/wgsa/entrypoint.sh"]
