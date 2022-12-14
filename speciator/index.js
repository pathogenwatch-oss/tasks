/* eslint no-console: 0 */

const path = require('path');

const { closestMatchSync } = require('mash-node-native');

const referencesDir = require('mash-sketches');
const sketchFilePath =
  path.join(referencesDir, 'refseq-archaea-bacteria-fungi-viral-k16-s400.msh');

const fastaFilePath = process.argv[2];

const mash = closestMatchSync(sketchFilePath, fastaFilePath);

const createMashSpeciator = require('mash-speciator');
const metadataFilePath =
  path.join(referencesDir, 'refseq-archaea-bacteria-fungi-viral-k16-s400.json');
const speciator = createMashSpeciator(sketchFilePath, metadataFilePath);

const results = speciator.queryResults(mash) || {};

console.log(
  JSON.stringify({
    taxId: results.refseqTaxId.toString(),
    speciesId: results.speciesTaxId.toString(),
    speciesName: results.speciesScientificName,
    genusId: results.genusTaxId ? results.genusTaxId.toString() : undefined,
    genusName: results.genusScientificName || undefined,
    superkingdomId: results.superkingdomTaxId ? results.superkingdomTaxId.toString() : undefined,
    superkingdomName: results.superkingdomName || undefined,
    referenceId: results.refseqId,
    mashDistance: results.mashDistance,
    pValue: results.pValue,
    matchingHashes: results.matchingHashes,
  })
);
