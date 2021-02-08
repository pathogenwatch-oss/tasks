const BsonStream = require('bson-stream');
const fs = require('fs');

const outputFolder = process.argv[2];

function saveFile(originalSamFile, label) {
  const lines = originalSamFile.split(/\r?\n/);
  lines[0] = `>${label}`;

  process.stdout.write(lines.join("\n"));
  process.stdout.write("\n");
}

async function saveAlignmentFiles(readStream) {
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
          saveFile(chunk.analysis.alignment.fasta, genomeId);
        }
      }
    }
  }

  return ids;
}

Promise.resolve(process.stdin)
  .then((stream) => stream.pipe(new BsonStream()))
  .then(saveAlignmentFiles)
  .catch(console.error);
