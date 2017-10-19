FROM golang:alpine as go

COPY src /tmp

RUN go build -o /tmp/ngmast /tmp/ngmast.go

FROM debian:stretch-slim

ENV PATH=/root/bin:$PATH

RUN apt-get update && \
    apt-get install -y \
      python \
      python-pip \
      git && \
  pip install --user --install-option="--install-scripts=\$HOME/bin/" git+https://github.com/MDU-PHL/ngmaster.git && \
  rm -rf /tmp/* && \
  apt-get remove -y \
    python-dev \
    build-essential \
    make \
    git \
    gettext \
    libexpat-dev \
    libncurses-dev && \
  apt-get clean autoclean && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt /var/lib/cache /var/lib/log

RUN echo 'y' | /root/bin/ngmaster --update

COPY --from=go /tmp/ngmast /root/bin
COPY bin/* /root/bin/

CMD ["/root/bin/entrypoint.sh"]
