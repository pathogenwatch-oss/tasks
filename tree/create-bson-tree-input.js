const BSON = require('bson');
const fs = require('fs');

const bson = new BSON();

function reformat(profile) {
  return profile.reduce((list, item) => {
    if (item.filter) return list;
    list.push({
      familyId: item.familyId,
      alleles: item.alleles.reduce((memo, allele) => {
        if (allele.duplicate === false) {
          memo.push({
            id: allele.id,
            rR: allele.rR,
            mutations: allele.mutations,
          });
        }
        return memo;
      }, []),
    });
    return list;
  }, []);
}

function main() {
  const genomes = [];

  for (let index = 0; index < process.argv.length - 2; index++) {
    genomes.push({ _id: new BSON.ObjectID(), fileId: index.toString() });
  }

  process.stdout.write(
    bson.serialize({ genomes })
  );

  let id = 0;
  for (let index = 2; index < process.argv.length; index++) {
    const file = process.argv[index];
    const genome = genomes[index - 2];
    console.error(genome.fileId, file);
    const data = fs.readFileSync(file);
    const core = JSON.parse(data);
    const doc = {
      _id: genome._id,
      fileId: genome.fileId,
      analysis: {
        core: {
          profile: reformat(core.profile),
        },
      },
    };
    process.stdout.write(bson.serialize(doc));
    id++;
  }
}

main();
