from ete3 import Tree
import sys

tree = Tree(sys.stdin.read())

# root tree
tree.set_outgroup("wuhan-hu-1")

# prune tree
ids_to_keep = list(tree.get_leaf_names())
ids_to_keep.remove('wuhan-hu-1')
tree.prune(ids_to_keep, preserve_branch_length=True)

tree.ladderize()

print(tree.write(format=1), end="")
