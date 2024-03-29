#!/usr/bin/env bash

set -eu -o pipefail

sudo apt update

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common unzip zip rename

sudo apt upgrade -y

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

apt-cache policy docker-ce

sudo apt install -y docker-ce

sudo systemctl status docker

# manual input required here.
docker login registry.gitlab.com

sudo reboot