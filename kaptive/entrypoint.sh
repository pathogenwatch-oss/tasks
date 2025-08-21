#!/usr/bin/env bash

set -euo pipefail

# Function to report errors
error_report() {
    echo "Error: Command failed: $BASH_COMMAND" >&2
}

trap 'error_report' ERR

echo "SPECIES = ${SPECIES}" >&2

# Create the encoded FASTA
if ! sanitiser -trim 20 encode - > /tmp/tmp.fa; then
    echo "Error: Failed to create encoded FASTA file." >&2
    exit 1
fi

# Run Kaptive
if  ! python /Kaptive/kaptive-runner.py -s "${SPECIES}" -f /tmp/tmp.fa | sanitiser -json decode -; then
    echo "Error: Failed to run Kaptive." >&2
    exit 1
fi
