// const fs = require('fs').promises;

/**
 * N.B. This file is used by the middle-end, please be careful ES6 features
 */

function extractContigsFromFastaFileString(fastaFileString) {
  //
  // Trim, and split assembly string into array of individual contigs
  // then filter that array by removing empty strings
  //
  return fastaFileString.trim().split('>').filter(function (element) {
    return (element.length > 0);
  });
}

function splitContigIntoParts(contig) {
  // Split contig string into parts
  return contig.split(/\n/)
    .filter(function (part) {
      // Filter out empty parts
      return (part.length > 0 && !(part.startsWith(';')));
    })
    .map(function (contigPart) {
      return contigPart.trim();
    });
}

function extractDnaStringFromContig(contig) {
  const contigParts = splitContigIntoParts(contig);
  //
  // DNA sequence can contain:
  // 1) "Whatever has been allowed upstream" characters.
  // 2) White spaces (e.g.: new line characters).
  //
  // The first line of FASTA file contains id and description.
  // The second line theoretically contains comments (starts with #).
  //
  // To parse FASTA file you need to:
  // 1. Separate assembly into individual contigs by splitting file's content by > character.
  //    Note: id and description can contain > character.
  // 2. For each sequence: split it by a new line character,
  //    then convert resulting array to string ignoring the first (and rarely the second) element of that array.
  //
  // -----------------------------
  // Parse DNA sequence string
  // -----------------------------
  //
  // Create sub array of the contig parts array - cut the first element (id and description).
  const contigPartsWithNoIdAndDescription = contigParts.splice(1, contigParts.length);
  //

  //
  // Contig string without id, description, comment is only left with DNA sequence string(s).
  //
  //
  // Convert array of DNA sequence substrings into a single string
  // Remove whitespace
  //
  return contigPartsWithNoIdAndDescription.join('').replace(/\s/g, '').toUpperCase();
}

function extractDnaStringsFromContigs(contigs) {
  const dnaStrings = [];
  let dnaString;
  contigs.forEach(function (contig) {
    dnaString = extractDnaStringFromContig(contig);
    dnaStrings.push(dnaString);
  });
  return dnaStrings;
}

function calculateN50(dnaSequenceStrings) {
  //
  // Calculate N50
  // http://www.nature.com/nrg/journal/v13/n5/box/nrg3174_BX1.html
  //

  // Order array by sequence length DESC
  const sortedDnaSequenceStrings = dnaSequenceStrings.sort(function (a, b) {
    return b.length - a.length;
  });

  // Calculate sums of all nucleotides in this assembly by adding current contigs length to the sum of all previous contig lengths
  // Contig length === number of nucleotides in this contig
  let assemblyNucleotideSums = [],
    // Count sorted dna sequence strings
    sortedDnaSequenceStringCounter = 0;

  for (; sortedDnaSequenceStringCounter < sortedDnaSequenceStrings.length; sortedDnaSequenceStringCounter++) {
    if (assemblyNucleotideSums.length > 0) {
      // Add current contigs length to the sum of all previous contig lengths
      assemblyNucleotideSums.push(sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length + assemblyNucleotideSums[assemblyNucleotideSums.length - 1]);
    } else {
      // This is a "sum" of a single contigs length
      assemblyNucleotideSums.push(sortedDnaSequenceStrings[sortedDnaSequenceStringCounter].length);
    }
  }

  // Calculate one-half of the total sum of all nucleotides in the assembly
  const assemblyNucleotidesHalfSum = Math.floor(assemblyNucleotideSums[assemblyNucleotideSums.length - 1] / 2);

  //
  // Sum lengths of every contig starting from the longest contig
  // until this running sum equals one-half of the total length of all contigs in the assembly.
  //

  // Store nucleotides sum
  let n50Sum = 0,
    // N50 object
    assemblyN50 = {},
    // Count again sorted dna sequence strings
    n50Counter = 0;

  for (; n50Counter < sortedDnaSequenceStrings.length; n50Counter++) {
    // Update nucleotides sum
    n50Sum = n50Sum + sortedDnaSequenceStrings[n50Counter].length;
    // Contig N50 of an assembly is the length of the shortest contig in this list
    // Check if current sum of nucleotides is greater or equals to half sum of nucleotides in this assembly
    if (n50Sum >= assemblyNucleotidesHalfSum) {
      assemblyN50['sequenceNumber'] = n50Counter + 1;
      assemblyN50['sum'] = n50Sum;
      assemblyN50['sequenceLength'] = sortedDnaSequenceStrings[n50Counter].length;
      break;
    }
  }

  return assemblyN50;
}

function calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings) {
  let totalNumberOfNucleotidesInDnaStrings = 0;
  dnaStrings.forEach((dnaString) => {
    totalNumberOfNucleotidesInDnaStrings = totalNumberOfNucleotidesInDnaStrings + dnaString.length;
  });
  return totalNumberOfNucleotidesInDnaStrings;
}

function calculateTotalNumberOfNsInDnaStrings(dnaStrings) {
  let totalNumberOfNsInDnaStrings = 0;
  dnaStrings.forEach((dnaString) => {
    totalNumberOfNsInDnaStrings = totalNumberOfNsInDnaStrings + (dnaString.match(/[^ACGT]/g) || []).length;
  });
  return totalNumberOfNsInDnaStrings;
}

function calculateAverageNumberOfNucleotidesInDnaStrings(dnaStrings) {
  const totalNumberOfNucleotidesInDnaStrings = calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
  const numberOfDnaStrings = dnaStrings.length;
  return Math.floor(totalNumberOfNucleotidesInDnaStrings / numberOfDnaStrings);
}

function calculateSmallestNumberOfNucleotidesInDnaStrings(dnaStrings) {
  const numberOfNucleotidesInDnaStrings = dnaStrings.map(function (dnaString) {
    return dnaString.length;
  });
  return numberOfNucleotidesInDnaStrings.reduce(function (previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString) {
    return Math.min(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString);
  });
}

function calculateBiggestNumberOfNucleotidesInDnaStrings(dnaStrings) {
  const numberOfNucleotidesInDnaStrings = dnaStrings.map(function (dnaString) {
    return dnaString.length;
  });
  return numberOfNucleotidesInDnaStrings.reduce((previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString) => Math.max(previousNumberOfNucleotidesInDnaString, currentNumberOfNucleotidesInDnaString));
}

function calculateSumsOfNucleotidesInDnaStrings(dnaStrings) {
  //
  // Get array of sums: [1, 2, 3, 6, 12, etc]
  //

  //
  // Sort dna strings by their length
  //
  const sortedDnaStrings = dnaStrings.sort(function (a, b) {
    return b.length - a.length;
  });

  //
  // Calculate sums of all nucleotides in this assembly by adding current contigs length to the sum of all previous contig lengths
  //
  const sumsOfNucleotidesInDnaStrings = [];
  sortedDnaStrings.forEach((sortedDnaString) => {
    if (sumsOfNucleotidesInDnaStrings.length === 0) {
      sumsOfNucleotidesInDnaStrings.push(sortedDnaString.length);
    } else {
      sumsOfNucleotidesInDnaStrings.push(sortedDnaString.length + sumsOfNucleotidesInDnaStrings[sumsOfNucleotidesInDnaStrings.length - 1]);
    }
  });

  return sumsOfNucleotidesInDnaStrings;
}

function calculateGCContent(dnaSequenceStrings) {
  let count = 0;
  dnaSequenceStrings.forEach(sequenceString => {
    for (let i = 0; i < sequenceString.length; i++) {
      const char = sequenceString[i];
      if (char === 'C' || char === 'G') {
        count++;
      }
    }
  });
  return count;
}


function analyseFasta(fastaFileString) {
  const contigs = extractContigsFromFastaFileString(fastaFileString);
  const dnaStrings = extractDnaStringsFromContigs(contigs);
  const assemblyN50Data = calculateN50(dnaStrings);
  const totalNumberOfNucleotidesInDnaStrings = calculateTotalNumberOfNucleotidesInDnaStrings(dnaStrings);
  const totalNumberOfNsInDnaStrings = calculateTotalNumberOfNsInDnaStrings(dnaStrings);
  const metrics = {
    totalNumberOfContigs: contigs.length,
    assemblyN50Data,
    contigN50: assemblyN50Data.sequenceLength,
    sumsOfNucleotidesInDnaStrings: calculateSumsOfNucleotidesInDnaStrings(dnaStrings),
    totalNumberOfNucleotidesInDnaStrings,
    totalNumberOfNsInDnaStrings,
    averageNumberOfNucleotidesInDnaStrings: calculateAverageNumberOfNucleotidesInDnaStrings(dnaStrings),
    smallestNumberOfNucleotidesInDnaStrings: calculateSmallestNumberOfNucleotidesInDnaStrings(dnaStrings),
    biggestNumberOfNucleotidesInDnaStrings: calculateBiggestNumberOfNucleotidesInDnaStrings(dnaStrings),
    gcContent: (100 * calculateGCContent(dnaStrings) / (totalNumberOfNucleotidesInDnaStrings - totalNumberOfNsInDnaStrings)).toFixed(1),
  };

  return {
    length: metrics.totalNumberOfNucleotidesInDnaStrings,
    contigs: metrics.totalNumberOfContigs,
    smallestContig: metrics.smallestNumberOfNucleotidesInDnaStrings,
    largestContig: metrics.biggestNumberOfNucleotidesInDnaStrings,
    averageContig: metrics.averageNumberOfNucleotidesInDnaStrings,
    N50: metrics.contigN50,
    N50Contig: metrics.assemblyN50Data.sequenceNumber,
    nonATCG: metrics.totalNumberOfNsInDnaStrings,
    gcContent: metrics.gcContent,
    contigSums: metrics.sumsOfNucleotidesInDnaStrings,
  };
}


require('get-stdin')()
// const file = 'test.fasta';
// fs.readFile(file)
//   .then(buffer => buffer.toString())
  .then(analyseFasta)
  .then(metrics => console.log(JSON.stringify(metrics)));
