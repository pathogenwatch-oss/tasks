#!/bin/bash

set -euo pipefail

# Variable to store the failed command
FAILED_COMMAND=""

# Function to report the failed command
cleanup() {
    if [ -n "$FAILED_COMMAND" ]; then
        echo "Error: The following command failed: $FAILED_COMMAND" >&2
    fi
}

# Set up trap to ensure cleanup happens on exit
trap cleanup EXIT

# Ensure required environment variables are set
if [ -z "${SCHEME:-}" ]; then
    FAILED_COMMAND="Environment variable check"
    echo "Error: SCHEME must be set" >&2
    exit 1
fi

# Save input to temporary file
if ! cat - > /tmp/input.fasta; then
    FAILED_COMMAND="cat - > /tmp/input.fasta"
    echo "Error: Failed to save input to temporary file" >&2
    exit 1
fi

# Run Resfinder
if ! python -m virulencefinder -o out -d "${SCHEME}" -ifa /tmp/input.fasta >/dev/null 2>&1; then
    FAILED_COMMAND="python -m virulencefinder -o out -d ${SCHEME} -ifa /tmp/input.fasta"
    echo "Error: virulencefinder failed to run" >&2
    exit 1
fi

# Run formatter
if ! python virulencefinder_formatter.py out/input.json; then
    FAILED_COMMAND="python virulencefinder_formatter.py ${SCHEME}"
    echo "Error: Formatter failed to run" >&2
    exit 1
fi