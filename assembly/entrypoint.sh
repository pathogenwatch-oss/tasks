#!/bin/bash

set -eu -o pipefail

cat | tar -x -C /data/reads

{
  echo "##### Reads #####"
  find /data/reads
  echo

  echo "##### Nextflow #####"
  /nextflow run main.nf \
    -c /pipelines/local.config \
    -work-dir /data/workdir \
    --careful \
    --input_dir /data/reads \
    --output_dir /data/output \
    --pipeline_info /data/output/info \
    --fastq_pattern "*{R,_}{1,2}*.fastq.gz" \
    --adapter_file adapters.fas \
    --qc_conditions qc_conditions_nextera_relaxed.yml \
    --depth_cutoff 100 \
    --prescreen_size_check 20000000
} 1>&2

output=$(ls /data/output/assemblies/*/*.fasta | head -1)
cat $output > /dev/stdout
