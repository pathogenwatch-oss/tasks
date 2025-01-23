ARG VERSION=4.6.0

FROM genomicepidemiology/resfinder:${VERSION}

# Install packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir typer && \
    pip cache purge

# Copy required files
COPY entrypoint.sh output_model.py resfinder_formatter.py /

# Set executable permissions
RUN chmod +x /entrypoint.sh

# Set default values for build-time arguments
ARG SCHEME=salmonella
ARG SCHEME_OUT_NAME=${SCHEME}

# Set environment variables
ENV SCHEME=${SCHEME} \
    SCHEME_OUT_NAME=${SCHEME_OUT_NAME}

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]