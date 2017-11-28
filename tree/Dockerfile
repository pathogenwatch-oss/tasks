FROM golang:1.9-alpine as go

COPY build-matrix.go /wgsa/build-matrix.go

RUN apk add --update git
RUN go get github.com/pkg/bson
RUN cd /wgsa && go build /wgsa/build-matrix.go
RUN chmod +x /wgsa/build-matrix

FROM conoria/alpine-r

# Install ape, phangorn, and jsonlite
RUN echo "install.packages('ape', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('phangorn', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('jsonlite', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

COPY --from=go /wgsa/build-matrix /wgsa/build-matrix
COPY create-tree.r /wgsa/create-tree.r
COPY entrypoint.sh /wgsa/entrypoint.sh

WORKDIR /wgsa

CMD ["/wgsa/entrypoint.sh"]
