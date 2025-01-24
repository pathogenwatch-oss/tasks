#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Pipe failures in a pipeline will be caught
set -o pipefail

VERSION=${1}

# Create a temporary file
temp_file="input.fasta"

# Ensure the temporary file is deleted on script exit
trap 'rm -f "$temp_file"' EXIT

# Function to report errors
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Read FASTA input from STDIN and write to the temporary file
cat > "$temp_file" || error_exit "Failed to write input to temporary file"

# Check if the temporary file is empty
if [ ! -s "$temp_file" ]; then
    error_exit "No input received"
fi

#echo "$VERSION"
# Run stecfinder and pipe the output to read_results.py
stecfinder -i "$temp_file" | python read_results.py - json --version=${VERSION} || error_exit "Failed to process input with stecfinder and read_results.py"