#!/usr/bin/Rscript --vanilla --default-packages=utils

# Get the command arguments
args <- commandArgs(TRUE)

inputFile <- args[1]
distFile <- paste(args[1],"dist", sep=".")
treeFile <- args[2]

#Load library
library(ape)
library(phangorn)

# Read similarity matrix
m <- as.matrix(read.table(inputFile, head=T, row.names=1))
# m <- read.csv(inputFile, head=F, row.names=1, sep=",")

# Build NJ tree
arbol <- nj(as.dist(m))

# This attempt at mid-point rooting doesn't work.
arbol_mid = midpoint(arbol)

# Save Newick file
write.tree(arbol_mid, file = treeFile, append = FALSE, digits = 10, tree.names = FALSE)

