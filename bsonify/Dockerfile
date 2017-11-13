FROM node:8-slim as node

COPY index.js /wgsa/index.js
COPY node_modules/ /wgsa/node_modules/

WORKDIR /wgsa

CMD ["node", "/wgsa/index.js"]
