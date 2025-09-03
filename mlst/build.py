# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "docker",
#     "typer",
# ]
# ///

import json
import sys
from collections import defaultdict
from typing import Annotated

import docker
import typer
from docker.errors import APIError, BuildError, ImageNotFound


def build(
    schemes_file: Annotated[
        str, typer.Argument(help="Path to the updated_schemes.json file")
    ],
    push: Annotated[
        bool, typer.Option("--push", "-p", help="Push the built images to GitLab")
    ] = False,
):
    """This script takes output from the mlst build process and uses it to construct the
    PW-ready images. It also outputs the updates for the tasks.json file."""
    with open(schemes_file, "r") as f:
        updated_schemes = json.load(f)

    client = docker.from_env()
    configs = defaultdict(list)
    for scheme in updated_schemes.values():
        # Check if the source image exists
        try:
            _ = client.images.get(scheme["image"])
        except ImageNotFound:
            print(
                f"Unable to find the source image for {scheme['image']} locally",
                file=sys.stderr,
            )
            try:
                _ = client.images.pull(scheme["image"])
                print(
                    f"Pulled the source image for {scheme['image']} successfully",
                    file=sys.stderr,
                )
            except APIError as e:
                print(
                    f"Error pulling the source image for {scheme['image']}: {e}",
                    file=sys.stderr,
                )
                exit(1)
        name = scheme["image"].split("/")[-1]
        new_image_name = f"registry.gitlab.com/cgps/pathogenwatch-tasks/{name}"
        print(f"Building image {new_image_name} for {scheme['name']}", file=sys.stderr)
        try:
            image, log = client.images.build(
                path=".",
                tag=new_image_name,
                rm=True,
                buildargs={
                    "SOURCE_IMAGE": scheme["image"],
                },
            )
            task_info = name.split(":")
            for target in scheme["targets"]:
                configs[target["taxid"]].append(
                    {
                        "task": task_info[0],
                        "version": task_info[1],
                    }
                )
        except BuildError as e:
            print(f"Error building image for {scheme['name']}: {e}", file=sys.stderr)
            exit(1)
        if push:
            print(f"Pushing image {new_image_name}", file=sys.stderr)
            client.images.push(new_image_name)
    print(json.dumps(configs), file=sys.stdout)


if __name__ == "__main__":
    typer.run(build)
