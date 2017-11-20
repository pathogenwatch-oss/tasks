FROM conoria/alpine-r

# Install Ape
RUN echo "install.packages('ape', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

# Install Phangorn
RUN echo "install.packages('phangorn', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

# Install jsonlite
RUN echo "install.packages('jsonlite', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

COPY entrypoint.sh /wgsa/entrypoint.sh
COPY create-tree.r /wgsa/create-tree.r

WORKDIR /wgsa

ENTRYPOINT ["sh", "/wgsa/entrypoint.sh"]

