ARG VERSION=4.4.2-salmonella

FROM registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:${VERSION}

ARG SCHEME=salmonella
ENV SCHEME=${SCHEME}

COPY modify_resfinder.py add_version.py version.txt /

COPY ${SCHEME}_mods.csv /

RUN python /modify_resfinder.py /${SCHEME}_mods.csv

RUN sed -i 's&resfinder_formatter.py ${SCHEME}&resfinder_formatter.py ${SCHEME} | python /add_version.py&' /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]