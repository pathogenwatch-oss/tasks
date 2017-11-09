FROM node:8-slim as node

FROM registry.gitlab.com/cgps/wgsa-back-end:v64.4-tree

COPY --from=node /usr/local/bin/node /usr/local/bin/node

COPY build-matrix.js /wgsa/build-matrix.js
COPY node_modules/ /wgsa/node_modules/

COPY create-tree.r /wgsa/create-tree.r
COPY distance-score-snp.py /wgsa/distance-score-snp.py

COPY entrypoint.sh /wgsa/entrypoint.sh

WORKDIR /wgsa

ENTRYPOINT ["sh", "/wgsa/entrypoint.sh"]
