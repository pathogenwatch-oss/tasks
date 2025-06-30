import argparse
import json
import sys

from more_itertools import first


def read_config(config_path):
    """
    Read the JSON config file.

    :param config_path: Path to the config file
    :return: Dictionary containing the config
    """
    try:
        with open(config_path, "r") as config_file:
            return json.load(config_file)
    except FileNotFoundError:
        print(f"Error: Config file not found at {config_path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in config file {config_path}", file=sys.stderr)
        sys.exit(1)


def read_input(input_path):
    """
    Read JSON input from the specified file.

    :param input_path: Path to the input JSON file
    :return: Dictionary containing the input data
    """
    try:
        with open(input_path, "r") as input_file:
            return json.load(input_file)
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in input file {input_path}", file=sys.stderr)
        sys.exit(1)


def transform_data(pf_result, config):
    """
    Transform the plasmidfinder result into pathogenwatch format, and add versioning information.

    :param pf_result: Dictionary containing the plasmidfinder JSON output
    :param config: Dictionary containing the config
    :return: Dictionary containing the transformed data
    """
    library = first(pf_result["plasmidfinder"]["results"].keys())
    result = config | {"Library": library, "Inc Matches": []}
    sublibs = pf_result["plasmidfinder"]["results"][library]
    for matches in sublibs.values():
        if matches == "No hit found":
            continue
        try:
            for match in matches.values():
                transformed_match = {
                    "Contig": match["contig_name"],
                    "Match ID": match["hit_id"],
                    "Group": "",
                    "Inc Match": match["plasmid"],
                    "Percent Identity": match["identity"],
                    "Match Coverage": match["coverage"],
                    "Contig Start": match["positions_in_contig"].split("..")[0],
                    "Contig End": match["positions_in_contig"].split("..")[1],
                    "Reference Start": match["position_in_ref"].split("..")[0],
                    "Reference End": match["position_in_ref"].split("..")[1],
                }
                result["Inc Matches"].append(transformed_match)
        except AttributeError:
            print(json.dumps(pf_result), file=sys.stderr)
            raise ValueError("Invalid plasmidfinder JSON output")
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Process JSON input based on a config file."
    )
    parser.add_argument("input", help="Path to the JSON input file")
    parser.add_argument("config", help="Path to the JSON config file")
    args = parser.parse_args()

    config = read_config(args.config)
    input_data = read_input(args.input)

    output_data = transform_data(input_data, config)

    json.dump(output_data, sys.stdout)


if __name__ == "__main__":
    main()
