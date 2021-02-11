FROM python:3.8.7-slim

WORKDIR /

RUN apt-get update && apt-get install -y curl && apt-get clean

RUN curl https://nodejs.org/dist/v14.15.4/node-v14.15.4-linux-x64.tar.gz | tar -xz --directory /usr/local --strip-components 1
RUN npm install bson-stream

RUN curl -L http://www.microbesonline.org/fasttree/FastTreeDbl > /bin/FastTree && chmod +x /bin/FastTree

RUN curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 > /bin/jq && chmod +x /bin/jq

RUN pip install ete3 six numpy

COPY NC_045512.2.fasta /wuhan-reference.fasta
COPY save-files.js /save-files.js
COPY prune-tree.py /prune-tree.py

CMD node /save-files.js | \
    cat wuhan-reference.fasta - | FastTree -gtr -nosupport -nt | \
    python prune-tree.py | \
    jq --raw-input --slurp --compact-output '{ newick: .  }'
