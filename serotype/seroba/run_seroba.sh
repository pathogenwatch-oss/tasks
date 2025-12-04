#!/usr/bin/env bash

set -euo pipefail

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Function to handle errors
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Write STDIN to temp file
cat - > "$TEMP_DIR/assembly.fas" || error_exit "Failed to write assembly to temp file"

echo "Written file to $TEMP_DIR/assembly.fas, starting process" >&2

# Simulate reads from assembly
ngsngs \
  -i "$TEMP_DIR/assembly.fas" \
  -o "$TEMP_DIR/assembly" \
  --coverage 50 \
  --length 500 \
  --cycle 100 \
  --sequencing PE \
  --format fq \
  --seed 12345 \
  --qualityscore 40 --noerror ||
  error_exit "Failed to simulate reads"

echo "Simulated reads" >&2

# Run seroba
seroba runSerotyping --coverage 10 /seroba/database \
    "$TEMP_DIR/assembly_R1.fq" "$TEMP_DIR/assembly_R2.fq" "$TEMP_DIR/assembly" > /dev/null 2>&1 ||
    error_exit "Failed to run seroba"

echo "Ran seroba" >&2

# Write value to STDOUT
awk -F ',' 'END { printf("{\"source\":\"SeroBA\",\"value\":\"%s\"}\n", $2) }' "$TEMP_DIR/assembly/pred.csv" ||
    error_exit "Failed to extract prediction"
