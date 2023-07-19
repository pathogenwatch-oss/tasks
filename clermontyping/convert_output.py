import ast
import json
import sys

with open(sys.argv[1], 'r') as f:
    result = f.readline().strip().split('\t')

arpa, chua, yjaa, tspe4_c2 = tuple(ast.literal_eval(result[2]))

print(json.dumps({
    'detectedGenes': ast.literal_eval(result[1]),
    'arpA': arpa,
    'chuA': chua,
    'yjaA': yjaa,
    'TspE4.C2': tspe4_c2,
    'groupCEAlleles': ast.literal_eval(result[3]),
    'phylogroup': result[4]
}))
