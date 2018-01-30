/* eslint no-param-reassign: 0 */

module.exports = function formatProfile(result) {
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
};
