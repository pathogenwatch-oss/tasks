ARG VERSION=v3.0.5

FROM ubuntu:latest AS curl

RUN apt -y update && apt -y install ca-certificates curl xz-utils && curl --version

#ENTRYPOINT ["/bin/bash"]
RUN curl -Lk -o curl-static.tar.gz https://github.com/stunnel/static-curl/releases/download/8.2.0/curl-static-amd64-8.2.0.tar.xz && \
    tar -xJf curl-static.tar.gz

FROM registry.gitlab.com/cgps/cgps-paarsnp:$VERSION

COPY --from=curl /curl /usr/bin/

COPY entrypoint.sh /wgsa/entrypoint.sh

ENTRYPOINT ["/wgsa/entrypoint.sh"]
