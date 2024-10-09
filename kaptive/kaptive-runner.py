import csv
import json
import os
import subprocess
import sys
import uuid

import click as click


# Currently, this only runs the acinetobacter baumanii databases.


def run_kaptive(
    fasta_path: str, database_name: str, uuid: str
) -> dict[str, str]:
    os.mkdir(f"/tmp/{uuid}")
    output_tsv = f"/tmp/{uuid}.tsv"
    output = subprocess.run(
        ["kaptive", "assembly", database_name, fasta_path, "-o", output_tsv],
        check=True,
        capture_output=True,
    )
    with open(output_tsv) as csv_fh:
        reader = csv.DictReader(csv_fh, delimiter="\t")
        for row in reader:
            record = row
            del record["Assembly"]
            return record


def run_type(fasta_path: str, database: str) -> dict[str, str]:
    kaptive_result = run_kaptive(
        fasta_path,
        database,
        uuid.uuid4().hex,
    )
    return kaptive_result


def get_version():
    output = subprocess.run(["kaptive", "--version"], check=True, capture_output=True)
    return output.stdout.decode("utf-8").strip()


@click.command()
@click.option(
    "-f",
    "--fasta_path",
    required=True,
    help="FASTA file path."
)
@click.option(
    "-s",
    "--species",
    required=False,
    type=click.Choice(["kpsc", "ab",],case_sensitive=False),
    default="kpsc",
    help="Species to search against.",
)
def run_fasta(fasta_path: str, species: str):
    version = get_version()
    locus_databases = {
        "kpsc": [
            {"tag": "kpsc_k", "name": "K", "key": "kLocus"},
            {"tag": "kpsc_o", "name": "O", "key": "oLocus"},
            # {"tag": "kpsc_k_variant", "name": "K locus variant"},
        ],
        "ab": [
            {"tag": "ab_k", "name": "K", "key": "kLocus"},
            {"tag": "ab_o", "name": "OC", "key": "oLocus"},
        ],
    }

    results = {database["key"]: run_type(fasta_path, database["tag"]) for database in locus_databases[species]}

    output = {
        "kaptiveVersion": version,
    }

    for database in locus_databases[species]:
        results[database["key"]]["name"] = database["name"]
        output[database["key"]] = results[database["key"]]

    print(json.dumps(output), file=sys.stdout)


if __name__ == "__main__":
    run_fasta()
