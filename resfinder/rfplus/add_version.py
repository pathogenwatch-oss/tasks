import json
import sys

import typer


def add_version():
    """ Reads json from STDIN and adds the modification library version to it."""

    # print("Adding mod lib version to json", file=sys.stderr)

    with open("/version.txt", "r") as f:
        version = f.read().strip()
    for line in sys.stdin:
        result_obj = json.loads(line.strip())
        result_obj["versions"]["modDbVersion"] = version
        print(json.dumps(result_obj, default=vars), file=sys.stdout)


if __name__ == "__main__":
    typer.run(add_version)
