ARG PIPELINE_VERSION

FROM registry.gitlab.com/cgps/ghru/pipelines/dsl2/pipelines/assembly:${PIPELINE_VERSION}

ARG NF_VERSION
ARG PIPELINE_VERSION
ENV NXF_VER=${NF_VERSION}

# Install nextflow
RUN set -x && \
    curl -fsSL get.nextflow.io | bash && \
    chmod +rx nextflow && \
    useradd -s /bin/bash cgps-user && \
    mkdir -p /pipelines/.nextflow /data/workdir /data/reads /data/output/info && \
    cd /pipelines && \
    git clone -b ${PIPELINE_VERSION} https://gitlab.com/cgps/ghru/pipelines/dsl2/pipelines/assembly.git

ENV NXF_HOME=/pipelines/.nextflow

RUN /nextflow info
COPY ./entrypoint.sh ./local.config /pipelines/
RUN chmod +rx /pipelines/entrypoint.sh && \
    chown -R cgps-user:cgps-user /data /pipelines

ENV NXF_OFFLINE=TRUE

USER cgps-user
WORKDIR /pipelines/assembly

ENTRYPOINT [ "/pipelines/entrypoint.sh" ]
