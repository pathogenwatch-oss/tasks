import json
import sys

def get_genes_and_snps(path):
    with open(path, 'r') as core_file:
        data = json.load(core_file)
    genes = {gene for gene,details in data['coreProfile']['coreProfile'].items() if details is not None}
    all_mutations = ((gene, details.get('mutations', [])) for gene,details in data['coreProfile']['coreProfile'].items() if (details is not None and details.get('mutations')))
    snps = ((gene, {"{}|{}".format(mutation['mut'], mutation['refI']) for mutation in mutations if mutation['type'] == 'S'}) for gene, mutations in all_mutations)
    return genes, snps

def compare(sequences):
    seq_genes, _seq_snps = get_genes_and_snps(sequences[0])
    seq_snps = dict(_seq_snps)
    for other_sequence in sequences[1:]:
        other_seq_genes, other_seq_snps = get_genes_and_snps(other_sequence)
        common_genes = seq_genes.intersection(other_seq_genes)
        distances = (len(snps.symmetric_difference(seq_snps.get(gene, set()))) for gene,snps in other_seq_snps if gene in common_genes)
        yield float(sum(distances)) / len(common_genes)
  
results = compare(sys.argv[1:])
sys.stdout.write(str(next(results)))
for result in results:
    sys.stdout.write("\t%s" % result)