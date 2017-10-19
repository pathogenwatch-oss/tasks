/* eslint no-console: 0 */

const fs = require('fs');
const path = require('path');

const { closestMatchSync } = require('mash-node-native');

const referencesDir = require('mash-sketches');
const sketchFilePath =
  path.join(referencesDir, 'refseq-archaea-bacteria-fungi-viral-k16-s400.msh');

const fastaFilePath = process.argv[2];

const mash = closestMatchSync(sketchFilePath, fastaFilePath);

const createMashSpeciator = require('mash-speciator');
const metadataFilePath =
  path.join(referencesDir, 'refseq-archaea-bacteria-fungi-viral-k16-s400.csv');
const speciator = createMashSpeciator(sketchFilePath, metadataFilePath);

const results = speciator.queryResults(mash) || {};

console.log(
  JSON.stringify({
    organismName: results.refseqScientificName,
    organismId: results.organismTaxId,
    speciesId: results.speciesTaxId,
    speciesName: results.speciesScientificName,
    genusId: results.genusTaxId,
    genusName: results.genusScientificName,
    referenceId: results.refseqId,
    mashDistance: results.mashDistance,
    pValue: results.pValue,
    matchingHashes: results.matchingHashes,
  })
);
