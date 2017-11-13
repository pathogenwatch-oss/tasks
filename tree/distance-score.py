import json
import sys

def get_genes_and_alleles(path):
    with open(path, 'r') as core_file:
        data = json.load(core_file)
    return {gene: el['alleleId'] for gene, el in data['coreProfile']['coreProfile'].items() if el is not None}

def compare(sequences):
    seq_genes_and_alleles = get_genes_and_alleles(sequences[0])
    seq_genes = set(seq_genes_and_alleles.keys())
    seq_alleles = set(seq_genes_and_alleles.values())
    for other_sequence in sequences[1:]:
        other_seq_genes_and_alleles = get_genes_and_alleles(other_sequence)
        other_seq_genes = set(other_seq_genes_and_alleles.keys())
        other_seq_alleles = set(other_seq_genes_and_alleles.values())
        yield 1 - (float(len(seq_alleles.intersection(other_seq_alleles))) / len(seq_genes.intersection(other_seq_genes)))

results = compare(sys.argv[1:])
sys.stdout.write(str(next(results)))
for result in results:
    sys.stdout.write("\t%s" % result)