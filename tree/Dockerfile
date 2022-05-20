ARG CORE=v2.0.0-10

FROM registry.gitlab.com/cgps/cgps-core-fp:schemes-${CORE} as core

FROM golang:1.9-alpine as go

COPY build-matrix.go /wgsa/build-matrix.go
COPY get-kernel-size.go /wgsa/get-kernel-size.go

RUN apk add --update git && \
    go get gitlab.com/cgps/pkg-bson && \
    cd /wgsa && go build /wgsa/build-matrix.go && \
    chmod +x /wgsa/build-matrix && \
    cd /wgsa && go build /wgsa/get-kernel-size.go && \
    chmod +x /wgsa/get-kernel-size

FROM rocker/r-base

# Install ape, phangorn, and jsonlite
RUN echo "install.packages('ape', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('phangorn', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('jsonlite', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

COPY create-tree.r /wgsa/create-tree.r
COPY --from=go /wgsa/build-matrix /wgsa/build-matrix
COPY --from=go /wgsa/get-kernel-size /wgsa/get-kernel-size
COPY --from=core /schemes/*/*_ks.jsn /wgsa/

COPY entrypoint.sh /wgsa/entrypoint.sh

WORKDIR /wgsa

CMD ["/wgsa/entrypoint.sh"]
