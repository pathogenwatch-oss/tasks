FROM node:8-slim as node

FROM registry.gitlab.com/cgps/wgsa-test-images/cgps-core-msa

COPY --from=node /usr/local/bin/node /usr/local/bin/node

COPY input.js /wgsa/input.js
COPY node_modules/ /wgsa/node_modules/

COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT ["sh", "/wgsa/entrypoint.sh"]
