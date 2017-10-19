FROM registry.gitlab.com/cgps/cgps-mlst/cgmlst:1.0.0

COPY formatter.js /wgsa

CMD [ "/usr/local/bin/node", "--max-old-space-size=4096", "/usr/local/mlst/index.js", "|", "/usr/local/bin/node", "/wgsa/formatter.js" ]
