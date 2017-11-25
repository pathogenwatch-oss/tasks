
function getFilteredFamilyIds(query, subject) {
  const ids = new Set();
  for (let i = 0; i < query.filter.filteredAlleles.length; i++) {
    ids.add(query.filter.filteredAlleles[i].familyId);
  }
  for (let i = 0; i < subject.filter.filteredAlleles.length; i++) {
    ids.add(subject.filter.filteredAlleles[i].familyId);
  }
  return ids;
}

function getCommonIds(query, subject) {
  const filteredIds = getFilteredFamilyIds(query, subject);
  const ids = [];
  const queryProfileIds = Object.keys(query.core.profile);
  for (let i = 0; i < queryProfileIds.length; i++) {
    if (!(queryProfileIds[i] in subject.core.profile)) continue;
    if (filteredIds.has(queryProfileIds[i])) continue;
    ids.push(queryProfileIds[i])
  }
  return ids;
}

function fastScore(differenceCount, sequenceCoordinates) {
  if (typeof differenceCount !== 'number' || isNaN(differenceCount)) {
    throw new Error('NaN :(');
  }
  if (typeof sequenceCoordinates.start !== 'number' || typeof sequenceCoordinates.stop !== 'number') {
    throw new Error('NaN :(');
  }
  return { differenceCount, sequenceCoordinates };
}

function calculateReferenceRangeOverlap(queryRange, subjectRange) {
  let maxStart;
  let minStop;
  const isQueryForward = queryRange.start <= queryRange.stop;
  const isSubjectForward = subjectRange.start <= subjectRange.stop;
  if (isQueryForward == isSubjectForward) {
    if (isQueryForward) {
      maxStart = Math.max(queryRange.start, subjectRange.start);
      minStop = Math.min(queryRange.stop, subjectRange.stop);
    } else {
      maxStart = Math.max(queryRange.stop, subjectRange.stop);
      minStop = Math.min(queryRange.start, subjectRange.start);
    }
  } else {
    if (isQueryForward) {
      maxStart = Math.max(queryRange.start, subjectRange.stop);
      minStop = Math.min(queryRange.stop, subjectRange.start);
    } else {
      maxStart = Math.max(queryRange.stop, subjectRange.start);
      minStop = Math.min(queryRange.start, subjectRange.stop);
    }
  }

  return { start: maxStart, stop: minStop };
}

function mutationsByRange(allele, range) {
  const selectedMutations = {};

  for (const key of Object.keys(allele.map)) {
    const mutationPosition = parseInt(key, 10);
    if (mutationPosition < range.start) {
      continue;
    } 
    if (range.stop < mutationPosition) {
      break;
    }
    selectedMutations[key] = allele.map[key];
  }

  return selectedMutations;
}

function calculateDiff(queryMutations, subjectMutations) {
  let shared = 0;

  for (const queryKey of Object.keys(queryMutations)) {
    if (queryKey in subjectMutations && queryMutations[queryKey] === subjectMutations[queryKey]) {
      shared++;      
    }   
  }

  return (Object.keys(queryMutations).length - shared) + (Object.keys(subjectMutations).length - shared);
}

function compareAlleles(queryAllele, subjectAllele) {
  if (queryAllele.alleleId === subjectAllele.alleleId) {
    return fastScore(0, queryAllele.referenceRange);
  }
  const overlap = calculateReferenceRangeOverlap(queryAllele.referenceRange, subjectAllele.referenceRange);
  const queryMutations = mutationsByRange(queryAllele, overlap);
  const subjectMutations = mutationsByRange(subjectAllele, overlap);
  const differenceCount = calculateDiff(queryMutations, subjectMutations);
  return fastScore(differenceCount, overlap);
}

function scoreFunction(queryAlleles, subjectAlleles) {
  if (queryAlleles.length === 1 && subjectAlleles.length === 1) {
    const score = compareAlleles(queryAlleles[0], subjectAlleles[0]);
    return [ score ];
  }
    
  const sharedCount = Math.min(queryAlleles.length, subjectAlleles.length);

  // Now we need to match the alleles together and only keep the closest matches up to sharedCount.
  const diffs = {};
  const overlaps = {};
  const data = {};

  for (const queryAllele of queryAlleles) {
    diffs[queryAllele.alleleId] = {};
    overlaps[queryAllele.alleleId] = {};
    data[queryAllele.alleleId] = {};

    for (const subjectAllele of subjectAlleles) {
      const score = compareAlleles(queryAllele, subjectAllele);

      diffs[queryAllele.alleleId][subjectAllele.alleleId] = score.differenceCount;
      overlaps[queryAllele.alleleId][subjectAllele.alleleId] = score.sequenceCoordinates;
      data[queryAllele.alleleId][subjectAllele.alleleId] = score;
    }
  }

  // Got all diff scores, so now pair up by using greedy pair wise approach
  let allPaired = false;
  const seenPair = new Set();
  const seenFirst = new Set();
  const scores = [];

  let minDiffs = 0;

  while (!allPaired) {
    for (const alleleId1 of Object.keys(data)) {
      if (seenFirst.has(alleleId1)) {
        continue;
      }
      for (const alleleId2 of Object.keys(data[alleleId1])) {
        if (data[alleleId1][alleleId2].differenceCount === minDiffs && !seenPair.has(alleleId2)) {
          scores.push(data[alleleId1][alleleId2]);
          // Now ensure neither is used in another pairing.
          seenFirst.add(alleleId1);
          seenPair.add(alleleId2);
          break;
        }
      }
    }
    minDiffs++;
    if (seenFirst.size === sharedCount) {
      allPaired = true; // last pair seen
    }
  }

  return scores;
}

function scoreBuilder(expectedKernelSize, familyScores) {
  let sharedLoci = 0;
  let sharedNts = 0;
  let numDifferences = 0.0;

  for (const scores of familyScores) {
    for (const score of scores) {
      sharedLoci++;
      sharedNts += Math.abs(score.sequenceCoordinates.start - score.sequenceCoordinates.stop) + 1;
      numDifferences += score.differenceCount;
    }
  }

  let coverageRatio = 0.0;
  
  if (sharedNts > 0) {
    coverageRatio = sharedNts / expectedKernelSize;
  } else {
    console.error('Unexpected: No shared NTs with core.');
    return expectedKernelSize;
  }

  // console.debug('coverageRatio={} sharedNts={} expectedKernelSize={}', coverageRatio, sharedNts, expectedKernelSize);

  if (0 == numDifferences) {
    return 0;
  }

  return Math.round(numDifferences / coverageRatio);
}

function compare(expectedKernelSize, query, subject) {
  const queryProfile = query.core.profile;
  const subjectProfile = subject.core.profile;
  const intersection = getCommonIds(query, subject);

  const scores = intersection.map(familyId => scoreFunction(queryProfile[familyId], subjectProfile[familyId]));
  // scores.forEach((x, i) => console.log(intersection[i], JSON.stringify(x)))
  
  const score = scoreBuilder(expectedKernelSize, scores);

  return score;
}

module.exports = compare;