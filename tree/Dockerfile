FROM node:8.1.4-alpine as node

FROM registry.gitlab.com/cgps/wgsa-test-images/compare-profiles:0.0.3 as java

FROM conoria/alpine-r

# Install ape, phangorn, and jsonlite
RUN echo "install.packages('ape', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('phangorn', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla &&\
    echo "install.packages('jsonlite', repos='http://cran.ma.imperial.ac.uk')" | /usr/bin/R --vanilla

# Default to UTF-8 file.encoding
ENV LANG C.UTF-8

# add a simple script that can auto-detect the appropriate JAVA_HOME value
# based on whether the JDK or only the JRE is installed
RUN { \
		echo '#!/bin/sh'; \
		echo 'set -e'; \
		echo; \
		echo 'dirname "$(dirname "$(readlink -f "$(which javac || which java)")")"'; \
	} > /usr/local/bin/docker-java-home \
	&& chmod +x /usr/local/bin/docker-java-home
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk/jre
ENV PATH $PATH:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin

ENV JAVA_VERSION 8u131
ENV JAVA_ALPINE_VERSION 8.151.12-r0

RUN set -x \
	&& apk add --no-cache \
		openjdk8-jre="$JAVA_ALPINE_VERSION" \
	&& [ "$JAVA_HOME" = "$(docker-java-home)" ]

# Add Nodejs
COPY --from=node /usr/local/bin/node /usr/local/bin/node

# Add compare-profiles
COPY --from=java /core/databases/ /core/databases/
COPY --from=java /data/ /data/
COPY --from=java /core/lib/ /core/lib/
COPY --from=java /core/compare-profiles.jar /core/compare-profiles.jar

COPY build-matrix.js /wgsa/build-matrix.js
COPY compare-bson-data.js /wgsa/compare-bson-data.js
COPY compare.js /wgsa/compare.js
COPY node_modules/ /wgsa/node_modules/
COPY create-tree.r /wgsa/create-tree.r
COPY entrypoint.sh /wgsa/entrypoint.sh

WORKDIR /wgsa

ENTRYPOINT ["sh", "/wgsa/entrypoint.sh"]
