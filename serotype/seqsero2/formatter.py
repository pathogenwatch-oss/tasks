import json
import sys

sys.stdin.readline()
sys.stdin.readline()

result = {"source": "SeqSero2"}
result.update({record[0].strip().replace("Predicted serotype", "value"): record[1].strip() for record in
               [line.split(":") for line in sys.stdin.readlines() if line.strip() != '']})
print(json.dumps(result))
