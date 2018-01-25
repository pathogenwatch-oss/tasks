/* eslint no-param-reassign: 0 */

function formatProfile(result) {
  const { coreProfile, filter } = result;
  // const filteredKeys = new Set(filter.filteredAlleles.map(x => x.familyId + x.alleleId));
  const filteredFamilyIds = new Set(filter.filteredAlleles.map(x => x.familyId));
  const doc = [];
  for (const [ familyId, profile ] of Object.entries(coreProfile.coreProfile)) {
    const alleles = [];
    const alleleIds = new Set();
    for (const { id, full, muts, pid, evalue, qId, qR, rR, r } of profile.alleles) {
      alleles.push({
        id,
        complete: full,
        pid,
        evalue,
        qid: qId,
        qstart: qR[0],
        qstop: qR[1],
        rstart: rR[0],
        rstop: rR[1],
        mutations: muts.reduce((mutations, { t, rI, mut }) => {
          if (t === 'S' && /[^ACTG]/i.test(mut) === false) {
            mutations[rI] = mut;
          }
          return mutations;
        }, {}),
        reverse: r,
        // exclude duplicated or filtered alleles
        filter: alleleIds.has(id),
        // filterFamily: filteredFamilyIds.has(familyId),
        // duplicate: alleleIds.has(id),
      });
      alleleIds.add(id);
    }
    doc.push({
      id: familyId,
      rlength: profile.refLength,
      alleles,
      filter: filteredFamilyIds.has(familyId),
    });
  }
  return doc;
}

function formatCore(result) {
  return {
    summary: result.coreSummary,
    fp: {
      reference: result.fp.subTypeAssignment,
      size: result.fp.fingerprintSize,
    },
    profile: formatProfile(result),
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
.then(formatCore)
.then(JSON.stringify)
.then(console.log)
.catch(e => {
  console.error(e);
  process.exit(1);
});

module.exports.formatProfile = formatProfile;
