#!/usr/bin/env bash

set -eou pipefail

# Function to handle errors
error_handler() {
    local last_command=$1
    echo "Error: Command '$last_command' failed" >&2
    exit 1
}

# Set up the error trap
trap 'error_handler "${BASH_COMMAND}"' ERR

# Set a default value for PIRS_COVERAGE if not already set
export PIRS_COVERAGE=${PIRS_COVERAGE:-50}

# Ensure input is provided
if [ -t 0 ]; then
    echo "Error: No input provided. Please pipe in the input data." >&2
    exit 1
fi

# Run SeroBA and capture the result
result=$(cat - | /root/bin/run_seroba.sh)

# Check if result is empty
if [ -z "$result" ]; then
    echo "Error: SeroBA returned an empty result" >&2
    exit 1
fi

# Use jq to create the JSON output
jq -n --arg value "$result" '{ source: "SeroBA", value: $value }'