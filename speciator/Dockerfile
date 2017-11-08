FROM registry.gitlab.com/cgps/wgsa-middle-end/base:v3

RUN apk add --update --no-cache gsl

COPY . /opt/wgsa

RUN apk add --update --no-cache --virtual build-deps \
      git \
      g++ \
      python \
      make \
      gsl-dev \
      zlib-dev && \
    cd /opt/wgsa && \
      npm install --production && \
    apk del --purge build-deps

WORKDIR /opt/wgsa

CMD [ "sh", "/opt/wgsa/index.sh" ]
