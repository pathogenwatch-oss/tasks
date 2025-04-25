#!/usr/bin/env bash

export PIRS_COVERAGE=50
result=$(cat - | /root/bin/run_seroba.sh)
# warn=$([[ "$result" =~ ^(untypable|32F|33A/33F|11E|19F|32A|35A|06A|possible 6(A|C|D|E))$ ]] && echo 'true' || echo 'false')
jq -n \
   --arg value "$result" \
   '{ source: "SeroBA", value: $value }'
