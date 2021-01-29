const BsonStream = require('bson-stream');
const fs = require('fs');
const path = require('path');

const samFolder = process.argv[2];

function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file,
      data,
      (error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      },
    );
  });
}  

async function saveSamFiles(readStream) {
  const ids = [];

  for await (const chunk of readStream) {
    if (chunk.genomes) {
      for (const genome of chunk.genomes) {
        ids.push([
          genome._id.toString(),
          genome.fileId,
        ])
      }
    }
    else {
      const filePath = path.join(samFolder, `${chunk._id.toString()}.sam`);
      console.error('writing file', filePath, chunk.fileId);
      await writeFile(filePath, chunk.analysis.core.sam);
    }
  }

  return ids;
}

Promise.resolve(process.stdin)
  .then((stream) =>stream.pipe(new BsonStream()))
  .then(saveSamFiles)
  .then(JSON.stringify)
  .then(console.log)
  .catch(console.error);
