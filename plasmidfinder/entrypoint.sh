#!/usr/bin/env bash

# Description: This script processes a FASTA file through plasmidfinder and formats the output.
# It includes error handling and checks for the input file's validity pre- and post-sanitising.

set -eou pipefail

# Function to handle errors
error_handler() {
    local last_command=$1
    local line_number=$2
    echo "Error: Command '$last_command' failed on line $line_number" >&2
    exit 1
}

# Set up error trapping
trap 'error_handler "${BASH_COMMAND}" "${LINENO}"' ERR

# Check if input is provided
if [ ! -t 0 ]; then
    INPUT=$(cat)
else
    echo "Error: No input provided. Please pipe in the FASTA content." >&2
    exit 1
fi

# Create the encoded FASTA
if ! echo "$INPUT" | sanitiser -trim 20 encode - > /tmp/tmp.fa; then
    echo "Error: Failed to create encoded FASTA file." >&2
    exit 1
fi

# Check if the FASTA file exists and is non-zero in size
if [ ! -s /tmp/tmp.fa ]; then
    echo "Error: Encoded FASTA file is empty or does not exist." >&2
    exit 1
fi

# Run plasmidfinder and process the output
if ! plasmidfinder.py --speciesinfo_json "$(cat /${SCHEME}_tax.json)" -i /tmp/tmp.fa -o /output -q; then
    echo "Error: Failed to run plasmidfinder." >&2
    exit 1
fi

if ! python3 /wrapper.py /output/data.json /config.json | sanitiser decode -; then
    echo "Error: Failed to process the output." >&2
    exit 1
fi

# Clean up temporary file
rm -f /tmp/tmp.fa

echo "Plasmidfinder analysis completed successfully." >&2