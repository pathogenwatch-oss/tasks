const BsonStream = require('bson-stream');
const fs = require('fs');
const path = require('path');

const samFolder = process.argv[2];

async function saveSamFiles(readStream) {
  const ids = [];

  for await (const chunk of readStream) {
    if (chunk.genomes) {
      // this is header chunk
      for (const genome of chunk.genomes) {
        ids.push([
          genome._id.toString(),
          genome.fileId,
        ])
      }
    }
    else {
      // this is a core profile chunk
      const filePath = path.join(samFolder, `${chunk._id.toString()}.sam`);
      console.error('writing file', filePath, chunk.fileId);
      await fs.promises.writeFile(filePath, chunk.analysis.core.sam);
    }
  }

  return ids;
}

Promise.resolve(process.stdin)
  .then((stream) => stream.pipe(new BsonStream()))
  .then(saveSamFiles)
  .catch(console.error);
