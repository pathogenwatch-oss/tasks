FROM node:8.1.4-alpine as node

FROM registry.gitlab.com/cgps/wgsa-test-images/compare-profiles:0.0.5

# Install R
RUN apk add --no-cache R R-dev R-doc curl libressl-dev curl-dev libxml2-dev gcc g++ git coreutils bash ncurses &&\
    git clone https://github.com/ropensci/git2r.git &&\
      R CMD INSTALL --configure-args="--with-libssl-include=/usr/lib/" git2r &&\
      rm -rf git2r /tmp/* &&\
    R -q -e "install.packages(c('devtools', 'covr', 'roxygen2', 'testthat'), repos = 'https://cloud.r-project.org/')" &&\
      rm -rf /tmp/*

# Install ape, phangorn, and jsonlite
RUN echo "install.packages('ape', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('phangorn', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('jsonlite', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

# Install Nodejs
COPY --from=node /usr/local/bin/node /usr/local/bin/node

COPY build-matrix.js /wgsa/build-matrix.js
COPY node_modules/ /wgsa/node_modules/
COPY create-tree.r /wgsa/create-tree.r
COPY entrypoint.sh /wgsa/entrypoint.sh

WORKDIR /wgsa

ENTRYPOINT ["sh", "/wgsa/entrypoint.sh"]
