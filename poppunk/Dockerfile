FROM ubuntu:18.04

WORKDIR /src
RUN apt-get update --quiet && apt-get install --quiet --yes wget gcc git && \
  wget -nv https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
  bash Miniconda3-latest-Linux-x86_64.sh -b -f && \
  rm Miniconda3-latest-Linux-x86_64.sh && \
  wget -nv https://github.com/marbl/Mash/releases/download/v2.1/mash-Linux64-v2.1.tar && \
  tar xfo mash-Linux64-v2.1.tar && rm mash-Linux64-v2.1.tar && \
  git clone --branch v1.1.5 https://github.com/johnlees/PopPUNK.git

ENV PATH=$PATH:/root/miniconda3/bin:/src/mash-Linux64-v2.1
RUN conda config --add channels defaults && \
  conda config --add channels bioconda && \
  conda config --add channels conda-forge && \
  conda install --quiet --yes --file /src/PopPUNK/requirements.txt

COPY pathogenwatch_api.py PopPUNK/PopPUNK/
COPY entrypoint.py PopPUNK

# Add GPS reference data
RUN wget -nv https://www.pneumogen.net/gps/GPS_query.tar.bz2 && \
  wget -nv https://www.pneumogen.net/gps/gpsc_definitive.csv && \
  tar xjf GPS_query.tar.bz2 && rm GPS_query.tar.bz2

CMD [ "PopPUNK/entrypoint.py" ]
