ARG VERSION=4.4.2-salmonella

FROM registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:${VERSION}

ARG SCHEME=salmonella
ENV SCHEME=${SCHEME}

COPY modify_resfinder.py /

COPY ${SCHEME}_mods.csv /

RUN python /modify_resfinder.py /${SCHEME}_mods.csv


# Fill in the build steps here.