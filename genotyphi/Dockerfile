FROM golang:alpine as go

COPY formatter.go .

RUN go build formatter.go

FROM cgps/genotyphi:1.0.1

COPY --from=go /go/formatter /wgsa/formatter

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
