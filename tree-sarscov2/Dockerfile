FROM ubuntu

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update 
RUN apt-get install -y python3 python3-pip
RUN apt-get install -y curl git

RUN git clone --depth 1 -b master https://github.com/cov-ert/datafunk.git /datafunk && cd /datafunk/ && pip3 install .
RUN cd /datafunk/ && pip3 install .

RUN git clone --depth 1 -b master https://github.com/cov-ert/clusterfunk.git /clusterfunk && cd /clusterfunk/ && pip3 install .

ADD http://www.microbesonline.org/fasttree/FastTree /bin/FastTreeMP
RUN chmod +x /bin/FastTreeMP

RUN curl https://nodejs.org/dist/v14.15.4/node-v14.15.4-linux-x64.tar.gz | tar -xz --directory /usr/local --strip-components 1

RUN npm install bson-stream

COPY save-sam-files.js /save-sam-files.js
COPY newick-to-json.js /newick-to-json.js
COPY NC_045512.2.fasta /wuhan-reference.fasta
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT []
WORKDIR /

CMD ["/entrypoint.sh"]
