#!/usr/bin/Rscript --vanilla --default-packages=utils

# Get the command arguments
args <- commandArgs(TRUE)

inputFile <- args[1]

#Load library
library(ape)
library(phangorn)
library(methods)
library(jsonlite)

# Read similarity matrix
# m = matrix(0, 4, 4)
m <- data.matrix(read.table(inputFile, head=T, fill=TRUE, row.names=1))

# m <- as.matrix(read.table(inputFile, head=T, row.names=1))
# m <- read.csv(inputFile, head=F, row.names=1, sep=",")

 # Could use clipboard or read this from a file as well.
# mat <- data.matrix(read.table(text=txt, fill=TRUE, col.names=paste("V", 1:6))  )
# mat[upper.tri(mat)] <- t(mat)[upper.tri(mat)]
# m

# a = c(1,2,3,4,5,6)
# b= matrix(0, 4, 4)
# b[upper.tri(b, diag=FALSE)]=a
# b

# Build NJ tree
arbol <- nj(as.dist(m))

# This attempt at mid-point rooting does work.
arbol_mid = midpoint(arbol)

# Save Newick file
newick <- write.tree(arbol_mid, append = FALSE, digits = 10, tree.names = FALSE)
jsonlite::toJSON(list(newick = newick), auto_unbox = TRUE)