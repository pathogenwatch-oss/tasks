ARG CORE=v1.0.2

FROM registry.gitlab.com/cgps/wgsa-tasks/core:${CORE} as core

FROM golang:1.9-alpine as go

RUN apk add --update git
RUN go get gitlab.com/cgps/pkg-bson
COPY build-matrix.go /wgsa/build-matrix.go
RUN cd /wgsa && go build /wgsa/build-matrix.go
RUN chmod +x /wgsa/build-matrix
COPY get-kernel-size.go /wgsa/get-kernel-size.go
RUN cd /wgsa && go build /wgsa/get-kernel-size.go
RUN chmod +x /wgsa/get-kernel-size

FROM conoria/alpine-r

# Install ape, phangorn, and jsonlite
RUN echo "install.packages('ape', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('phangorn', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('jsonlite', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

COPY create-tree.r /wgsa/create-tree.r
COPY --from=go /wgsa/build-matrix /wgsa/build-matrix
COPY --from=go /wgsa/get-kernel-size /wgsa/get-kernel-size
COPY --from=core /usr/local/cgps-core-fp/schemes/*/*_ks.jsn /wgsa/

COPY entrypoint.sh /wgsa/entrypoint.sh

WORKDIR /wgsa

CMD ["/wgsa/entrypoint.sh"]
