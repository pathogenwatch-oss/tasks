import json
import sys
from collections import defaultdict
from typing import Any


def check_complete(match: dict[str, Any]) -> bool:
    return (
        match["ref_start_pos"] == 1 and match["ref_end_pos"] == match["ref_seq_length"]
    )


def format_result(result_str: str) -> dict[str, Any]:
    raw_result: dict[str, Any] = json.loads(result_str)
    return build_profile(
        extract_matches(raw_result["seq_regions"].values()), raw_result
    )


def build_profile(phenotype_matches, raw_result):
    profile: dict[str, dict[str, Any]] = {}
    for gene in sorted(raw_result["phenotypes"].keys()):
        profile[gene] = {
            "name": gene,
            "function": raw_result["phenotypes"][gene]["function"],
            "matches": phenotype_matches[gene],
        }
    return profile


def extract_matches(seq_regions):
    phenotype_matches: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for match in seq_regions:
        for phenotype in match["phenotypes"]:
            phenotype_matches[phenotype].append(
                {
                    "ref_id": match["ref_id"],
                    "name": match["name"],
                    "complete": check_complete(match),
                    "identity": match["identity"],
                    "contig": match["query_id"],
                    "query_start": match["query_start_pos"],
                    "query_end": match["query_end_pos"],
                    "ref_start": match["ref_start_pos"],
                    "ref_end": match["ref_end_pos"],
                    "ref_seq_length": match["ref_seq_length"],
                }
            )
    return phenotype_matches


def main(args: list[str]) -> None:
    if len(args) != 2:
        print(
            "Usage: python virulencefinder_formatter.py <input_file or '-' for STDIN>",
            file=sys.stderr,
        )
        sys.exit(1)

    input_source: str = args[1]

    if input_source == "-":
        # Read from STDIN
        result_str: str = sys.stdin.read()
    else:
        # Read from file
        try:
            with open(input_source, "r") as file:
                result_str: str = file.read()
        except FileNotFoundError:
            print(f"Error: File '{input_source}' not found.", file=sys.stderr)
            sys.exit(1)
        except IOError as e:
            print(f"Error reading file '{input_source}': {e}", file=sys.stderr)
            sys.exit(1)

    # Process the input using the format function
    # Output the formatted result as JSON
    print(
        json.dumps(
            {
                "versions": {
                    "wrapper": "0.1.0",
                    "virulencefinder": "v3.1.0",
                    "virulencefinder_db": "v2.0.1",
                },
                "profile": format_result(result_str),
            }
        )
    )


if __name__ == "__main__":
    main(sys.argv)
