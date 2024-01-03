import csv
import os
from pathlib import Path
from typing import Iterator

import typer
from Bio import SeqIO

__default_path = Path("/databases")


def resfinder_remove(name: str, directory: Path = __default_path / "resfinder_db") -> None:
    # Need to remove from phenotypes.txt, aminoglycoside.fsa and all.fsa.
    phenotypes_file = directory / "phenotypes.txt"
    new_phenotypes_file = directory / "new_phenotypes.txt"
    aminoglycoside_file = directory / "aminoglycoside.fsa"
    new_aminoglycoside_file = directory / "new_aminoglycoside.fsa"
    all_file = directory / "all.fsa"
    new_all_file = directory / "new_all.fsa"

    with open(phenotypes_file, "r") as in_f, open(new_phenotypes_file, "w") as out_f:
        for line in in_f.readlines():
            if line.startswith(f"{name}_"):
                continue
            out_f.write(line)

    with open(aminoglycoside_file, "r") as in_f, open(new_aminoglycoside_file, "w") as out_f:

        for sequence in SeqIO.parse(in_f, "fasta"):
            if sequence.id.startswith(f"{name}_"):
                continue
            SeqIO.write(sequence, out_f, "fasta")

    with open(all_file, "r") as in_f, open(new_all_file, "w") as out_f:
        for sequence in SeqIO.parse(in_f, "fasta"):
            if sequence.id.startswith(f"{name}_"):
                continue
            SeqIO.write(sequence, out_f, "fasta")

    os.rename(new_phenotypes_file, phenotypes_file)
    os.rename(new_aminoglycoside_file, aminoglycoside_file)
    os.rename(new_all_file, all_file)


def modify_resfinder(mod_csv: str) -> None:
    with open(mod_csv, "r") as f:
        reader: Iterator[dict[str, str]] = csv.DictReader(f)
        modifications: list[dict[str, str]] = [row for row in reader]
    # Trivial initial implementation for future simplicity.
    # We currently only have one type of modification, so no need to over-engineer.
    for modification in modifications:
        if modification["module"] == "resfinder":
            if modification["action"] == "remove":
                resfinder_remove(modification["name"])
    pass


if __name__ == "__main__":
    typer.run(modify_resfinder)
