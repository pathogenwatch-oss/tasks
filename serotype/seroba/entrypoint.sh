#!/usr/bin/env bash

result=$(cat - | /root/bin/run_seroba.sh)
jq --arg key0 'source' \
   --arg value0 'SeroBA' \
   --arg key1 'value' \
   --arg value1 "$result" \
    '. | .[$key0]=$value0 | .[$key1]=$value1 ' \
   <<<'{}'
