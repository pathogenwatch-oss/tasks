function getVariance(result) {
  const { core, filter } = result;
  const filteredKeys = new Set(filter.filteredAlleles.map(x => x.familyId));
  const doc = {};
  for (const familyId of Object.keys(core.p)) {
    if (filteredKeys.has(familyId)) continue;
    const entries = [];
    for (const { i, m, r } of core.p[familyId]) {
      entries.push({
        alleleId: i,
        start: Math.min(r[0], r[1]),
        stop: Math.max(r[0], r[1]),
        mutations: m,
      });
    }
    doc[familyId] = entries;
  }
  return doc;
}

function getMatches({ coreProfile }) {
  const matches = [];
  for (const id of Object.keys(coreProfile)) {
    for (const match of coreProfile[id].alleles) {
      matches.push({
        partial: match.full !== true,
        reversed: match.qR[0] > match.qR[1],
        evalue: null,
        identity: null,
        query: {
          id: match.qId,
          start: match.qR[0],
          stop: match.qR[1],
        },
        reference: {
          id,
          start: match.rR[0],
          stop: match.rR[1],
          length: null,
        },
      });
    }
  }
  return matches;
}

function format(result) {
  return {
    summary: result.coreSummary,
    variance: getVariance(result),
    fp: {
      reference: result.fp.subTypeAssignment,
      size: result.fp.fingerprintSize,
    },
    matches: getMatches(result.coreProfile),
  };
}

function read(stdin) {
  let ret = '';

  return new Promise((resolve) => {
    if (stdin.isTTY) {
      resolve(ret);
      return;
    }

    stdin.setEncoding('utf8');

    stdin.on('readable', () => {
      let chunk;
      while ((chunk = stdin.read())) {
        ret += chunk;
      }
    });

    stdin.on('end', () => {
      resolve(ret);
    });
  });
}

read(process.stdin)
.then(JSON.parse)
.then(format)
.then(JSON.stringify)
.then(console.log)
.catch(e => {
  console.error(e);
  process.exit(1);
});
