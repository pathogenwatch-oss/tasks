FROM python:3.9

RUN apt-get update \
    && apt-get -y install git ncbi-blast+

RUN pip install biopython click

RUN git clone https://github.com/katholt/Kaptive

COPY kaptive-runner.py /Kaptive/kaptive-runner.py

COPY entrypoint.sh /entrypoint.sh

WORKDIR /Kaptive

ENTRYPOINT ["sh", "/entrypoint.sh"]
