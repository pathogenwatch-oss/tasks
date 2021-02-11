FROM ubuntu

RUN apt-get update && apt-get install -y curl && apt-get clean

RUN curl -L https://github.com/lh3/minimap2/releases/download/v2.17/minimap2-2.17_x64-linux.tar.bz2 | tar -jxvf - && mv ./minimap2-2.17_x64-linux/minimap2 /bin/minimap2

RUN curl -L https://github.com/cov-ert/gofasta/releases/download/v0.0.3/gofasta-linux-amd64 > /bin/gofasta && chmod +x /bin/gofasta

RUN curl -L https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 > /bin/jq && chmod +x /bin/jq

COPY NC_045512.2.fasta /wuhan-reference.fasta

WORKDIR /

CMD /bin/minimap2 -a -x asm5 /wuhan-reference.fasta - | \
    /bin/gofasta sam toMultiAlign --reference /wuhan-reference.fasta |  \
    jq --raw-input --slurp --compact-output '{ fasta: .  }'
