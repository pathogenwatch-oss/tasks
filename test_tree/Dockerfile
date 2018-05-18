FROM node:8

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       apt-transport-https \
       ca-certificates \
       curl \
       software-properties-common \
       apt-utils \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - \
    && add-apt-repository \
          "deb [arch=amd64] https://download.docker.com/linux/debian \
          $(lsb_release -cs) \
          stable"

RUN apt-get update \
    && apt-get install -y --no-install-recommends docker-ce \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /src \
    && mkdir /data

COPY . /src/

RUN cd /src/tree \
    && npm install

WORKDIR /src

ENTRYPOINT ["./test-tree.sh", "/data"]