function getProfile(result) {
  const { coreProfile, filter, core } = result;
  const filteredKeys = new Set(filter.filteredAlleles.map(x => x.familyId));
  const doc = [];
  for (const [ familyId, profile ] of Object.entries(coreProfile.coreProfile)) {
    if (!(familyId in core.p)) {
      throw new Error(`Cannot find ${familyId}`);
    }
    const alleles = [];
    for (const { id, full, muts, pid, evalue, qId, qR, rR } of profile.alleles) {
      alleles.push({
        id,
        full,
        pid,
        evalue,
        qId,
        qR,
        rR,
        mutations: muts.reduce((mutations, { rI, mut }) => {
          mutations[rI] = mut;
          return mutations;
        }, {}),
      });
    }
    doc.push({
      familyId,
      filter: filteredKeys.has(familyId),
      refLength: profile.refLength,
      alleles,
    });
  }
  return doc;
}


function format(result) {
  return {
    summary: result.coreSummary,
    fp: {
      reference: result.fp.subTypeAssignment,
      size: result.fp.fingerprintSize,
    },
    profile: getProfile(result),
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
