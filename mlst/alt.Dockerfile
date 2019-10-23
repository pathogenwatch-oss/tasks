FROM registry.gitlab.com/cgps/cgps-mlst:alternative-mlst-201910141355-v2.0.5

COPY formatter.js /pathogenwatch/formatter.js
COPY entrypoint.sh /pathogenwatch/entrypoint.sh

CMD [ "sh", "/pathogenwatch/entrypoint.sh" ]
