const BsonStream = require('bson-stream');
const fs = require('fs');
const path = require('path');

const samFolder = process.argv[2];

function renameSam(originalSamFile, label) {
  const lines = originalSamFile.split(/\r?\n/);
  const cells = lines[2].split("\t");
  cells[0] = label;
  lines[2] = cells.join("\t");
  return lines.join("\n");
}

async function saveSamFiles(readStream) {
  const ids = [];

  for await (const chunk of readStream) {
    if (chunk.genomes) {
      // this is header chunk
      for (const genome of chunk.genomes) {
        ids.push([
          genome.fileId,
          genome._id.toString(),
        ])
      }
    }
    else {
      // this is a core profile chunk
      for (const [ fileId, genomeId ] of ids) {
        if (fileId === chunk.fileId) {
          const filePath = path.join(samFolder, `${genomeId}.sam`);
          const sam = renameSam(chunk.analysis.core.sam, genomeId);
          // console.error('writing file', filePath, chunk.fileId);
          await fs.promises.writeFile(filePath, sam);    
        }
      }
    }
  }

  return ids;
}

Promise.resolve(process.stdin)
  .then((stream) => stream.pipe(new BsonStream()))
  .then(saveSamFiles)
  .catch(console.error);
