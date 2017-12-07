const es = require('event-stream');
const Bson = require('bson');
const fs = require('fs');
const path = require('path');

const fileA = process.argv[2];
const fileB = process.argv[3];

function readJson(stream) {
  return new Promise((resolve, reject) => {
    const cache = {};
    stream
      .pipe(es.split())
      .pipe(
        es.map((data, done) => {
          if (data.length > 0) {
            const json = JSON.parse(data);
            if ('fileId' in json) {
              cache[json.fileId] = json.scores;
            }
          }
          done(null);
        })
      )
      .on('error', reject)
      .on('end', () => {
        resolve(cache);
      });
  });
}

function compare(left, right) {
  for (const fileId of Object.keys(left.scores)) {
    if (fileId in right.scores) {
      for (const fileId2 of Object.keys(left.scores[fileId])) {
        if (fileId2 in right.scores[fileId]) {
          if (left.scores[fileId][fileId2] !== right.scores[fileId][fileId2]) {
            console.error(`Score ${fileId}:${fileId2} mismatch ${left.scores[fileId][fileId2]} <> ${right.scores[fileId][fileId2]}`);
          }
        }
        else {
          throw new Error(`File ID ${fileId} is missing from ${right.name}`);
        }
      }
    }
    else {
      throw new Error(`File ID ${fileId} is missing from ${right.name}`);
    }
  }
}

Promise.all([
  readJson(fs.createReadStream(fileA, 'utf8')),
  readJson(fs.createReadStream(fileB, 'utf8')),
])
.then(([ left, right ]) => {
  compare({ name: fileA, scores: left }, { name: fileB, scores: right });
  compare({ name: fileB, scores: right }, { name: fileA, scores: left });
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
