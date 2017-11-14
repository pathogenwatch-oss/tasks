const es = require('event-stream');
const bs = require('bson-stream');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const mapLimit = require('async/mapLimit');

const dataPath = '.';
const matrixFile = 'matrix.csv';

const limit = process.env.WGSA_WORKERS || 8;

const ids = [];
const fileIds = [];
const coreProfiles = [];
const scoreCache = {};

function outputScores(input, vector) {
  const doc = { fileId: fileIds[input[0]], scores: {} };
  for (let i = 0; i < vector.length; i++) {
    doc.scores[fileIds[input[i + 1]]] = vector[i];
  }
  process.stdout.write(JSON.stringify(doc));
  process.stdout.write('\n');
}

function saveProfiles(stream) {
  return new Promise((resolve, reject) => {
    stream
      .pipe(new bs())
      .pipe(es.map((data, done) => {
        if (data.scores) {
          scoreCache[data.fileId] = data.scores;
          done();
        } else {
          delete data.analysis.core.__v;
          const coreProfile = data.analysis.core;
          ids.push(data._id.toString());
          fileIds.push(data.fileId);
          const file = path.join(dataPath, `core-${data._id}.json`);
          coreProfiles.push(file);
          fs.writeFile(file, JSON.stringify(coreProfile), done);
        }
      }))
      .on('error', reject)
      .on('end', () => resolve({ ids, coreProfiles }));
  });
}

function compareProfiles(input, done) {
  const args = input.reduce((memo, index) => {
    memo.push(path.join(dataPath, `core-${ids[index]}.json`));
    return memo;
  }, [ 'distance-score.py' ]);
  const child = spawn('python', args);

  const buffer = [];

  child.stdout.on('data', (data) => {
    buffer.push(data.toString());
  });

  child.on('close', (code) => {
    if(code === 0) {
      done(null, buffer.join('').split('\t'));
    } else {
      const error = [];
      child.stderr.on('data', (data) => {
        error.push(data.toString());
      });
      child.stderr.on('close', (data) => {
        done({ code, error: error.join('\n') });        
      });
    }
  });
}

function buildMatrix() {
  const matrix = [];
  const comparisons = [];
  for (let i = 0; i < ids.length; i++) {
    const row = fileIds[i];    
    matrix.push([]);
    const uncached = [ i ];
    for (let j = 0; j < i; j++) {
      const col = fileIds[j];
      const cache = scoreCache[row];
      if (row in scoreCache && col in scoreCache[row]) {
        matrix[i].push(scoreCache[row][col]);        
      } else {
        matrix[i].push(null);
        uncached.push(j);        
      }
    }
    if (uncached.length > 1) {
      comparisons.push(uncached);
    }
  }

  return new Promise((resolve, reject) => {
    mapLimit(
      comparisons,
      limit,
      (input, done) => {
        compareProfiles(input, (err, vector) => {
          if (err) return done(err);
          outputScores(input, vector);
          for (let i = 0; i < vector.length; i++) {
            matrix[input[0]][input[i + 1]] = vector[i];
          }
          done(null);
        });
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(matrix);
        }
      }
    );
  });
}

function buildTree(matrix) {
  const labels = ids;
  return new Promise((resolve, reject) => {
    const inputFile = fs.createWriteStream(matrixFile);
    inputFile.write('ID\t');
    inputFile.write(labels.join('\t'));
    inputFile.write('\n');
    for (let index = 0; index < matrix.length; index++) {
      inputFile.write(labels[index]);
      inputFile.write('\t');
      inputFile.write(matrix[index].join('\t'));
      inputFile.write('\n');
    }
    resolve(matrixFile);
  });
}

Promise.resolve(process.stdin)
  .then(saveProfiles)
  .then(buildMatrix)
  .then(buildTree)
  .catch(err => console.error('ERROR') || console.error(err));
