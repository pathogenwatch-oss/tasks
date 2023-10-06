import json
import sys

sys.stdin.readline()
sys.stdin.readline()

print(json.dumps(
    {record[0].strip(): record[1].strip() for record in
     [line.split(":") for line in sys.stdin.readlines() if line.strip() != '']}))
