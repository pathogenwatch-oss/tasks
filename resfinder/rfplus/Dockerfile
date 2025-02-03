ARG VERSION=4.4.2-salmonella

FROM registry.gitlab.com/cgps/pathogenwatch-tasks/resfinder:${VERSION}

ARG SCHEME=salmonella
ARG SCHEME_OUT_NAME=${SCHEME}

ENV SCHEME=${SCHEME} \
    SCHEME_OUT_NAME=${SCHEME_OUT_NAME}

COPY modify_resfinder.py add_version.py version.txt /

COPY mod_files /mod_files

RUN python /modify_resfinder.py "${SCHEME}" -m /mod_files

RUN sed -i 's&resfinder_formatter.py "${SCHEME}" "${SCHEME_OUT_NAME}"&resfinder_formatter.py "${SCHEME}" "${SCHEME_OUT_NAME}" | python /add_version.py&' /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]