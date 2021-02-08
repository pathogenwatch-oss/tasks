FROM ubuntu

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update 
RUN apt-get install -y python3 python3-pip
RUN apt-get install -y curl git

RUN git clone --depth 1 -b master https://github.com/cov-ert/datafunk.git /datafunk && cd /datafunk/ && pip3 install .

RUN curl -L https://github.com/lh3/minimap2/releases/download/v2.17/minimap2-2.17_x64-linux.tar.bz2 | tar -jxvf - && mv ./minimap2-2.17_x64-linux/minimap2 /bin/minimap2

ADD https://nodejs.org/dist/v14.15.4/node-v14.15.4-linux-x64.tar.gz /node.tar.gz
RUN tar -xzf node.tar.gz --directory /usr/local --strip-components 1 && rm /node.tar.gz

COPY formatter.js /formatter.js
COPY NC_045512.2.fasta /wuhan-reference.fasta
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT []

WORKDIR /

CMD ["/entrypoint.sh"]
