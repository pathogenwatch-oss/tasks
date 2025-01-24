import csv
import dataclasses
import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Annotated, Any, Callable, Iterable, Iterator
from io import TextIOWrapper
import typer

from output_model import (
    Agent,
    AntimicrobialPhenotype,
    Determinants,
    FullAcquiredMarker,
    FullVariantMarker,
    GeneMatch,
    PwResult,
    RpAcquired,
    RpVariant,
)

default_rf_db: Path = Path("/databases/resfinder_db")
default_pf_db: Path = Path("/databases/pointfinder_db")

marker_types = ["acquired", "variant"]


@dataclasses.dataclass
class Variant:
    mutation: str
    match_key: str
    source: str


@dataclasses.dataclass
class Match:
    accession: str
    name: str
    coverage: float
    identity: float
    reference_start: int
    reference_stop: int
    contig: str
    contig_start: int
    contig_stop: int
    source: str
    strand: int
    variants: list[Variant] = dataclasses.field(default_factory=list)


@dataclasses.dataclass
class Antimicrobial:
    name: str
    group: str


@dataclasses.dataclass
class GeneMarker:
    name: str
    accession: str
    gene: str
    type: str
    matches: list[Match]
    antibiotics: list[str]


@dataclasses.dataclass
class VariantMarker(GeneMarker):
    variant: str


@dataclasses.dataclass
class Phenotype:
    antimicrobial: Antimicrobial
    is_resistant: bool
    markers: list[GeneMarker | VariantMarker] = dataclasses.field(default_factory=list)


def read_tab_format(
    matches: dict[str, list[Match]], location: Path
) -> dict[str, GeneMarker]:
    with open(location) as rf_h:
        reader: Iterator[dict[str, str]] = csv.DictReader(rf_h, delimiter="\t")
        return {
            line["Resistance gene"]: GeneMarker(
                line["Resistance gene"],
                line["Accession no."],
                line["Resistance gene"],
                marker_types[0],
                [match for match in matches[line["Resistance gene"]]],
                [am.title() for am in line["Phenotype"].split(", ")],
            )
            for line in reader
        }


def read_resfinder(
    match_data: dict[str, list[Match]],
    results_dir: Path,
) -> dict[str, GeneMarker]:
    return read_tab_format(match_data, results_dir / "ResFinder_results_tab.txt")


def read_phenotype(
    antimicrobials: dict[str, Antimicrobial],
    results_dir: Path,
    scheme: str,
    scheme_name: str,
) -> list[Phenotype]:
    phenotypes: list[Phenotype] = []
    filename = (
        f"pheno_table_{scheme_name}.txt" if scheme != "other" else "pheno_table.txt"
    )
    with open(results_dir / filename, "r") as ph_h:
        for line in ph_h:
            if line.startswith("# WARNING:"):
                """
                Can be found at the end of files:
                # WARNING: Features with unknown phenotype
                # Feature_ID	Region	Database	Hit	Class
                parC;;1;;CP084529.1_108_v_AA	parC;;1;;CP084529.1
                """
                break
            if line.startswith("#") or line.strip() == "":
                continue
            phenotype: list[str] = line.split("\t")
            am = (
                phenotype[0]
                .replace(
                    "pipercallin+tazobactam", "piperacillin+tazobactam"
                )  # Typo in the database
                .title()
            )
            phenotypes.append(
                Phenotype(
                    antimicrobials[am],
                    phenotype[2] != "No resistance" and phenotype[2] != "NA",
                    [],
                )
            )
    return phenotypes


def read_pointfinder(
    matches: dict[str, list[Match]],
    results_dir: Path,
) -> dict[str, VariantMarker]:
    markers: dict[str, VariantMarker] = {}
    pointfinder_results_file = results_dir / "PointFinder_results.txt"
    if pointfinder_results_file.exists():
        with open(pointfinder_results_file, "r") as pf_h:
            reader: Iterator[dict[str, Any]] = csv.DictReader(pf_h, delimiter="\t")
            line: dict[str, str]
            for line in reader:
                mutation_name: str = (
                    line["Mutation"]
                    .replace("p.", "")
                    .replace("r.", "")
                    .replace("n.", "")
                )
                name_parts: list[str] = mutation_name.split(" ")[0:2]
                mutation_name = mutation_name.replace(" ", "_")
                markers[mutation_name] = VariantMarker(
                    mutation_name,
                    matches[name_parts[0]][0].accession,
                    name_parts[0],
                    marker_types[1],
                    matches[name_parts[0]],
                    [
                        am.title() for am in line["Resistance"].split(", ")
                    ],  # Needs to be filtered by antibiogram
                    name_parts[1],
                )
    return markers


def read_disinfinder(
    matches: dict[str, list[Match]],
    results_dir: Path,
) -> dict[str, GeneMarker]:
    disinfinder_results_file = results_dir / "DisinFinder_results_tab.txt"
    return (
        read_tab_format(matches, disinfinder_results_file)
        if disinfinder_results_file.exists()
        else {}
    )


def extend_antibiogram(
    phenotypes: list[Phenotype],
    rf_result: Iterable[GeneMarker],
    pf_result: Iterable[VariantMarker],
    df_result: Iterable[GeneMarker],
) -> list[Phenotype]:
    phenotypes_map: dict[str, Phenotype] = {
        phenotype.antimicrobial.name: phenotype for phenotype in phenotypes
    }

    for marker in rf_result:
        for antimicrobial in marker.antibiotics:
            if antimicrobial not in phenotypes_map:
                continue
            phenotypes_map[antimicrobial].markers.append(marker)

    for marker in pf_result:
        for antimicrobial in marker.antibiotics:
            if antimicrobial in phenotypes_map:
                phenotypes_map[antimicrobial].markers.append(marker)

    for marker in df_result:
        for antimicrobial in marker.antibiotics:
            if antimicrobial not in phenotypes_map:
                phenotypes_map[antimicrobial] = Phenotype(
                    Antimicrobial(antimicrobial, "Disinfectant"), True, []
                )
            phenotypes_map[antimicrobial].markers.append(marker)
    return phenotypes


def read_antimicrobials(
    am_file: Path,
) -> dict[str, Antimicrobial]:
    antimicrobials: dict[str, Antimicrobial] = {}
    with open(am_file) as am_f:
        am_f.readline()
        for line in am_f.readlines():
            row: [str] = line.title().strip().split("\t")
            clazz = row[0]
            for i in range(1, len(row)):
                antimicrobials[row[i]] = Antimicrobial(row[i], clazz)
    return antimicrobials


def read_result_json(results_dir: Path) -> dict[str, Any]:
    return json.load(open(results_dir / "input.json"))


def extract_match_data(
    matches: dict[str, dict[str, Any]], mutations: Iterator[dict[str, Any]]
) -> dict[str, list[Match]]:
    mutation_data: dict[str, list[Variant]] = defaultdict(list)

    for mutation in mutations:
        for link in mutation["seq_regions"]:
            mutation_data[link].append(
                Variant(
                    mutation["seq_var"].replace("p.", ""),
                    link,
                    mutation["ref_database"],
                )
            )

    processed: dict[str, list[Match]] = defaultdict(list)
    remove_version = re.compile(r"\.\d+$")
    for match in matches.values():
        strand = 1 if match["ref_start_pos"] < match["query_end_pos"] else -1
        accession: str = remove_version.sub("", match["ref_id"].split("_")[-1])
        processed[match["name"]].append(
            Match(
                accession,
                match["name"],
                match["coverage"],
                match["identity"],
                match["ref_start_pos"],
                match["ref_end_pos"],
                match["query_id"],
                match["query_start_pos"] if strand == 1 else match["query_end_pos"],
                match["query_end_pos"] if strand == 1 else match["query_start_pos"],
                match["ref_database"][0],
                strand,
                mutation_data[match["key"]],
            )
        )
    return processed


def read_salmonella_variants(f: TextIOWrapper) -> dict[str, dict[str, str]]:
    effects: dict[str, dict[str, str]] = defaultdict(dict)
    f.readline()
    for line in f.readlines():
        row: [str] = line.strip().split("\t")
        for mutant in row[6].split(","):
            if row[1] == "AA":
                variant = f"{row[0].split('_')[0]}_{row[5]}{row[3]}{mutant}"
            else:
                variant = f"{row[0].split('_')[0]}_{row[3]}{row[5]}>{mutant}"
            if len(row) == 13:
                effect: str = "RESISTANCE"
            else:
                effect: str = "CONTRIBUTES"
            for phenotype in row[8].split(","):
                effects[variant][phenotype.strip().lower()] = effect
    return effects


def read_ecoli_variants(f: TextIOWrapper) -> dict[str, dict[str, str]]:
    f.readline()
    effects: dict[str, dict[str, str]] = defaultdict(dict)

    for line in f.readlines():
        if line.startswith("#"):
            continue
        row: [str] = line.strip().split("\t")
        for mutant in row[6].split(","):
            if row[1] == "AA":
                variant = f"{row[0].split('_')[0]}_{row[5]}{row[3]}{mutant}"
            else:
                if "promoter" in row[0]:
                    name: str = "-".join(row[0].split("-")[0:2])
                else:
                    name: str = row[0].split("_")[0]
                if row[5] == "ins":
                    # e.g.. ampC-promoter_-15_-14insGT
                    position: int = int(row[3])
                    step: int = 1 if position > 1 else -1
                    coords: list[int] = sorted(
                        [position, position + (step * (len(mutant) - 1))]
                    )
                    positions: str = "_".join(
                        str(position)
                        for position in sorted(list(range(coords[0], coords[1] + 1)))
                    )
                    variant: str = f"{name}_{positions}{row[5]}{mutant}"
                else:
                    variant: str = f"{name}_{row[3]}{row[5]}>{mutant}"
            if len(row) <= 12:
                effect = "RESISTANCE"
            else:
                effect = "CONTRIBUTES"
            for antimicrobial in row[8].split(","):
                clean_am_name = antimicrobial.strip().lower()
                if clean_am_name in effects[variant]:
                    continue
                else:
                    effects[variant][clean_am_name] = effect
    return effects


variant_readers: dict[str, Callable[[TextIOWrapper], dict[str, dict[str, str]]]] = {
    "salmonella": read_salmonella_variants,
    "ecoli": read_ecoli_variants,
}


def read_variant_effects(
    phenotypes_file: Path, scheme: str
) -> dict[str, dict[str, str]]:
    effects: dict[str, dict[str, str]] = defaultdict(dict)
    if not phenotypes_file.exists():
        print(f"No phenotype file found at {phenotypes_file}", file=sys.stderr)
        return effects
    else:
        print(f"Reading phenotype file: {phenotypes_file}", file=sys.stderr)
    with open(phenotypes_file, "r") as f:
        return variant_readers[scheme](f)


def main(
    scheme: Annotated[
        str,
        typer.Argument(
            help="The scheme to use for the phenotype file, e.g. `ecoli` or `other`",
        ),
    ],
    scheme_out_name: Annotated[
        str,
        typer.Argument(
            help="The scheme extension for the SNP out files, e.g. pheno_table_{escherichia_coli}.txt",
        ),
    ],
    resfinder_directory: Annotated[
        Path,
        typer.Option(
            "-r",
            help="Location of the Resfinder results directory",
            exists=True,
            file_okay=False,
            dir_okay=True,
            writable=False,
            readable=True,
        ),
    ] = "resfinder_out",
    antimicrobials_file: Annotated[
        Path,
        typer.Option(
            "-a",
            help="Location of the Resfinder antibiotic_classes.txt",
            exists=True,
            file_okay=True,
            dir_okay=False,
            writable=False,
            readable=True,
        ),
    ] = default_rf_db
    / "antibiotic_classes.txt",
    phenotypes_file: Annotated[
        Path,
        typer.Option(
            "-p",
            help=(
                "Location of a pointfinder phenotypes file."
                "Will assume to use the scheme file provided in the image otherwise."
            ),
            exists=True,
        ),
    ] = None,
):
    scheme = scheme.replace(" ", "_")
    print(f"Formatting {scheme}", file=sys.stderr)
    if phenotypes_file is None:
        phenotypes_file = default_pf_db / f"{scheme_out_name}" / "phenotypes.txt"

    # While the full JSON includes everything and could be used to construct the result directly, it's easier to take
    # advantage of the pre-processed results. However, those don't include match data (e.g. contig and location).
    full_json: dict[str, Any] = read_result_json(resfinder_directory)
    variant_effects = read_variant_effects(phenotypes_file, scheme)
    match_data: dict[str, list[Match]] = extract_match_data(
        full_json["seq_regions"],
        full_json["seq_variations"].values(),
    )
    # Gather matches
    antimicrobials: dict[str, Antimicrobial] = read_antimicrobials(antimicrobials_file)
    rf_result: dict[str, GeneMarker] = read_resfinder(match_data, resfinder_directory)
    pf_result: dict[str, VariantMarker] = read_pointfinder(
        match_data, resfinder_directory
    )
    df_result: dict[str, GeneMarker] = read_disinfinder(match_data, resfinder_directory)

    # Construct unified antibiogram
    antibiogram: list[Phenotype] = extend_antibiogram(
        read_phenotype(antimicrobials, resfinder_directory, scheme, scheme_out_name),
        rf_result.values(),
        pf_result.values(),
        df_result.values(),
    )
    versions: dict[str, str] = {
        "amrfinderVersion": full_json["software_version"],
        "resfinderDbVersion": next(
            db["database_version"]
            for db in full_json["databases"].values()
            if db["database_name"] == "ResFinder"
        ),
    }
    try:
        pointfinder_db_version = next(
            db["database_version"]
            for db in full_json["databases"].values()
            if db["database_name"] == "PointFinder"
        )
        versions["pointfinderDbVersion"] = pointfinder_db_version
    except StopIteration:
        print("No pointfinder database version found", file=sys.stderr)

    try:
        disinfinder_db_version = next(
            db["database_version"]
            for db in full_json["databases"].values()
            if db["database_name"] == "DisinFinder"
        )
        versions["pointfinderDbVersion"] = disinfinder_db_version
    except StopIteration:
        print("No disinfinder database version found", file=sys.stderr)
    match: Match
    gene_matches: list[GeneMatch] = []
    for match_set in match_data.values():
        for match in match_set:
            gene_matches.append(
                GeneMatch(
                    match.identity,
                    match.contig,
                    match.contig_start,
                    match.contig_stop,
                    match.name,
                    match.reference_start,
                    match.reference_stop,
                    [variant.mutation for variant in match.variants],
                    match.strand == 1,
                )
            )

    acquired: list[FullAcquiredMarker] = [
        FullAcquiredMarker(
            marker.name, marker.accession, marker.gene, marker.antibiotics
        )
        for marker in rf_result.values()
        if marker.type == marker_types[0]
    ] + [
        FullAcquiredMarker(
            marker.name, marker.accession, marker.gene, marker.antibiotics
        )
        for marker in pf_result.values()
        if marker.type == marker_types[0]
    ]

    resistance_profile: list[AntimicrobialPhenotype] = []
    for phenotype in antibiogram:
        ac_determinants: list[RpAcquired] = [
            RpAcquired(marker.name)
            for marker in phenotype.markers
            if marker.type == marker_types[0]
        ]
        var_determinants: list[RpVariant] = [
            RpVariant(
                marker.gene,
                marker.variant,
                variant_effects[marker.name][phenotype.antimicrobial.name.lower()],
            )
            for marker in phenotype.markers
            if marker.type == marker_types[1]
        ]
        resistance_profile.append(
            AntimicrobialPhenotype(
                Agent(
                    phenotype.antimicrobial.name,
                    phenotype.antimicrobial.group,
                ),
                "RESISTANT" if phenotype.is_resistant else "NOT_FOUND",
                Determinants(ac_determinants, var_determinants),
            )
        )

    output_model = PwResult(
        versions,
        acquired,
        gene_matches,
        [
            FullVariantMarker(
                marker.name,
                marker.accession,
                marker.gene,
                marker.antibiotics,
                marker.variant,
            )
            for marker in pf_result.values()
            if marker.type == marker_types[1]
        ],
        resistance_profile,
    )

    print(json.dumps(output_model, default=vars))


if __name__ == "__main__":
    typer.run(main)
