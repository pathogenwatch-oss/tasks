FROM golang:alpine as go

COPY formatter.go .

RUN go build formatter.go && chmod +x formatter

FROM registry.gitlab.com/cgps/cgps-genotyphi:v1.1.2

COPY --from=go /go/formatter /wgsa/formatter

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "sh", "/entrypoint.sh"]
