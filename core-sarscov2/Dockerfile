FROM docker.io/evolbioinfo/minimap2:2da649d


ADD https://nodejs.org/dist/v14.15.4/node-v14.15.4-linux-x64.tar.gz /node.tar.gz
RUN tar -xzf node.tar.gz --directory /usr/local --strip-components 1 && rm /node.tar.gz

COPY formatter.js /formatter.js
COPY NC_045512.2.fasta /wuhan-reference.fasta
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT []

WORKDIR /

CMD ["/entrypoint.sh"]
