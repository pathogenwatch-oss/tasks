import csv
import json
import sys
from pathlib import Path
from typing import Iterator
import argparse


def run(input_file: Path, output_format: str, version: str):
    if input_file == Path("-"):
        f = sys.stdin
    else:
        f = open(input_file, "r")

    try:
        reader: Iterator[dict[str, str]] = csv.DictReader(f, delimiter="\t")
        row: dict[str, str | dict[str, str]] = next(reader)
        if output_format == "csv":
            print(",".join([row["Sample"], row["stx type"], version]))
        elif output_format == "json":
            row["versions"] = {
                "STECFinder": version,
                "wrapper": "1",
            }  # TODO: Handle versions better
            del row["Sample"]
            print(json.dumps(row))
        else:
            raise ValueError(f"Unsupported format: {output_format}")
    finally:
        if f is not sys.stdin:
            f.close()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert stecfinder output to different formats"
    )
    parser.add_argument(
        "input_file", type=Path, help="Input stecfinder TSV file or '-' for stdin"
    )
    parser.add_argument(
        "output_format", choices=["csv", "json"], help="Output format (csv or json)"
    )
    parser.add_argument("--version")

    args = parser.parse_args()
    if args.input_file != Path("-") and not args.input_file.is_file():
        parser.error(f"Input file {args.input_file} does not exist.")
    run(args.input_file, args.output_format, args.version)
    return 0


if __name__ == "__main__":
    sys.exit(main())
