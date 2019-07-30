#!/usr/bin/env bash

export PIRS_COVERAGE=50
result=$(cat - | /root/bin/run_seroba.sh)
warn=$([[ "$result" =~ ^(06D|11E|35A)$ ]] && echo 'true' || echo 'false')
jq -n \
   --arg value "$result" \
   --argjson warn $warn \
   '{ source: "SeroBA", value: $value, warn: $warn }'
