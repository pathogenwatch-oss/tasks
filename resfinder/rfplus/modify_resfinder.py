import csv
import os
import sys
from pathlib import Path
from typing import Annotated, Iterator

import typer
from Bio import SeqIO


def resfinder_remove(name: str, antibiotic_db: str, databases_dir: Path) -> None:
    resfinder_dir = databases_dir / "resfinder_db"
    # Need to remove from phenotypes.txt, aminoglycoside.fsa and all.fsa.
    phenotypes_file = resfinder_dir / "phenotypes.txt"
    new_phenotypes_file = resfinder_dir / "new_phenotypes.txt"
    antibiotic_fasta = resfinder_dir / f"{antibiotic_db}.fsa"
    new_antibiotic_fasta = resfinder_dir / f"new_{antibiotic_db}.fsa"
    all_file = resfinder_dir / "all.fsa"
    new_all_file = resfinder_dir / "new_all.fsa"

    with open(phenotypes_file, "r") as in_f, open(new_phenotypes_file, "w") as out_f:
        for line in in_f.readlines():
            if line.startswith(f"{name}_"):
                continue
            out_f.write(line)

    with open(antibiotic_fasta, "r") as in_f, open(new_antibiotic_fasta, "w") as out_f:
        for sequence in SeqIO.parse(in_f, "fasta"):
            if sequence.id.startswith(f"{name}_"):
                continue
            SeqIO.write(sequence, out_f, "fasta")

    with open(all_file, "r") as in_f, open(new_all_file, "w") as out_f:
        for sequence in SeqIO.parse(in_f, "fasta"):
            if sequence.id.startswith(f"{name}_"):
                continue
            SeqIO.write(sequence, out_f, "fasta")

    # Replace original files with modified versions.
    os.rename(new_phenotypes_file, phenotypes_file)
    os.rename(new_antibiotic_fasta, antibiotic_fasta)
    os.rename(new_all_file, all_file)


def add_panel(new_panel, databases_dir: Path) -> None:
    """Appends the new species panel onto phenotype_panels.txt. It could be more flexible and allow replacing an
    existing panel."""
    directory = databases_dir / "resfinder_db"
    with open(new_panel, "r") as al_f, open(
        directory / "phenotype_panels.txt", "a"
    ) as out_f:
        panel = al_f.read()
        print(f"Adding panel:\n{panel}", file=sys.stderr)
        out_f.write("\n")
        out_f.write(panel)


def alias_species_name(species_name: str) -> str:
    """Converts e.g. 'Listeria monocytogenes' to 'lmonocytogenes'."""
    return f"{species_name[0].lower()}{species_name.split()[1].lower()}"


def add_species(species_name: str, code_dir: Path, database_dir) -> None:
    """Adds the species to the abbreviations file and creates a fake SNP database."""
    simple_alias = alias_species_name(species_name)
    abbreviations_path = code_dir / "species_abbreviations.md"
    if not abbreviations_path.exists():
        raise FileNotFoundError(f"Abbreviations file not found: {abbreviations_path}")
    with open(abbreviations_path, "a") as fh:
        print(f"| {species_name.lower()} | {simple_alias} |\n", file=fh)

    cleaned_name = species_name.lower().replace(" ", "_")
    db_name = database_dir / "pointfinder_db" / cleaned_name
    db_name.mkdir(exist_ok=False)
    open(db_name / "RNA_genes.txt", "x").close()
    open(db_name / f"{cleaned_name}.fsa", "x").close()
    open(db_name / f"{cleaned_name}.name", "x").close()
    open(db_name / f"genes.txt", "x").close()
    with open(db_name / f"phenotypes.txt", "x") as ph_f:
        print(
            "\t".join(
                [
                    "#Gene_accession",
                    "TypeGene",
                    "Mutation ID",
                    "Codon_pos",
                    "Ref_nuc",
                    "Ref_codon",
                    "Res_codon",
                    "Class",
                    "Phenotype",
                    "PMID",
                    "Mechanism of resistance Notes",
                    "Required mutation",
                    "% abundance mutation required",
                ]
            ),
            file=ph_f,
        )

    with open(db_name / "resistens-overview.txt", "x") as ro_f:
        print(
            "\t".join(
                [
                    "#Gene_ID",
                    "Gene_name",
                    "Codon_pos",
                    "Ref_nuc",
                    "Ref_codon",
                    "Res_codon",
                    "Resistance",
                    "PMID",
                    "Mechanism",
                    "Notes",
                    "Required_mut",
                ]
            ),
            file=ro_f,
        )


def modify_resfinder(
    species_name: Annotated[str, typer.Argument()],
    mods_dir: Annotated[
        Path, typer.Option("-m", help="Mods file directory")
    ] = "mod_files",
    code_path: Annotated[
        Path, typer.Option("-c", help="Resfinder code directory")
    ] = "/usr/local/lib/python3.10/site-packages/resfinder",
    databases_path: Annotated[
        Path, typer.Option("-d", help="Resfinder database directory")
    ] = "/databases",
) -> None:
    print(f"Modifying ResFinder for {species_name}", file=sys.stderr)
    scheme_name = species_name.replace(" ", "_")
    mod_csv: Path = mods_dir / f"{scheme_name}_mods.csv"
    if mod_csv.exists():
        with open(mod_csv, "r") as f:
            reader: Iterator[dict[str, str]] = csv.DictReader(f)
            modifications: list[dict[str, str]] = [row for row in reader]
        # Trivial initial implementation for future simplicity.
        # We currently only have one type of modification, so no need to over-engineer.
        for modification in modifications:
            if modification["module"] == "resfinder":
                if modification["action"] == "remove":
                    resfinder_remove(
                        modification["name"],
                        modification["antibiotic_db"],
                        databases_path,
                    )

    new_panel: Path = mods_dir / f"{scheme_name}_panel.txt"

    if new_panel.exists():
        print(f"Adding panel from {new_panel}", file=sys.stderr)
        add_panel(new_panel, databases_path)
        add_species(species_name.replace("_", " "), code_path, databases_path)
    else:
        print(f"No panel found for {species_name} ({new_panel})", file=sys.stderr)


if __name__ == "__main__":
    typer.run(modify_resfinder)
