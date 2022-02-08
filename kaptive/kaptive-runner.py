import csv
import json
import os
import subprocess
import sys
from typing import Dict, Tuple, Optional

import click as click


# Currently, this only runs the acinetobacter baumanii databases.

def run_kaptive(fasta_path: str, database_path: str, uuid: str) -> Tuple[Optional[str], Dict[str, str]]:
    os.mkdir(f'/tmp/{uuid}')
    output = subprocess.run(
        [
            './kaptive.py',
            '-a', fasta_path,
            '-k', database_path,
            '-o', f'/tmp/{uuid}/'
        ],
        check=True,
        capture_output=True
    )
    with open(f'/tmp/{uuid}/kaptive_results_table.txt') as csv_fh:
        reader = csv.DictReader(csv_fh, delimiter='\t')
        for row in reader:
            fieldnames = reader.fieldnames
            record = row
            fieldnames.pop(0)
            del record['Assembly']
            return fieldnames, record


def run_type(fasta_path: str, database_path: str, locus) -> Tuple:
    kaptive_result = run_kaptive(
        fasta_path,
        os.path.join(database_path, f'Acinetobacter_baumannii_{locus}_primary_reference.gbk'),
        locus
    )
    return kaptive_result


def get_version():
    output = subprocess.run(
        [
            './kaptive.py',
            '--version'
        ],
        check=True,
        capture_output=True
    )
    return output.stdout.decode('utf-8').replace('Kaptive ', '').strip()


@click.command()
@click.option('-f', '--fasta_path', required=True, help='FASTA file path.')
@click.option('-d', '--database_path', required=False, default='reference_database', help='Database directory path')
def run_fasta(fasta_path: str, database_path: str):
    version = get_version()
    results = [run_type(fasta_path, database_path, locus) for locus in ['k_locus', 'OC_locus']]

    output = {
        'kaptiveVersion': version,
        'columns': results[0][0],
        'kLocus': results[0][1],
        'oLocus': results[1][1]
    }
    print(json.dumps(output), file=sys.stdout)


if __name__ == '__main__':
    run_fasta()
