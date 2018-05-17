const fs = require('fs');
const BSON = require('bson');

const bson = new BSON();

const formatProfile = require('../core/formatProfile');

function main() {
  const genomes = [];
  const idMap = {};

  for (let index = 0; index < process.argv.length - 2; index++) {
    const _id = new BSON.ObjectID();
    genomes.push({ _id, fileId: index.toString() });

    const file = process.argv[index + 2];
    idMap[_id] = file;
  }

  process.stdout.write(
    bson.serialize({ genomes })
  );

  let id = 0;
  for (let index = 2; index < process.argv.length; index++) {
    const file = process.argv[index];
    const genome = genomes[index - 2];
    const data = fs.readFileSync(file);
    const core = JSON.parse(data);
    const doc = {
      _id: genome._id,
      fileId: genome.fileId,
      analysis: {
        core
      },
    };
    process.stdout.write(bson.serialize(doc));
    id++;
  }

  fs.writeFileSync('./ids.json', JSON.stringify(idMap));
}

main();
