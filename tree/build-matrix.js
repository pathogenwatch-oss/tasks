const es = require('event-stream');
const BsonStream = require('bson-stream');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const mapLimit = require('async/mapLimit');
const Bson = require('bson');

const bson = new Bson();

const dataPath = '.';
const matrixFile = 'matrix.csv';

const limit = process.env.WGSA_WORKERS || 1;

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
    const startTime = process.hrtime();
    stream
      .pipe(new BsonStream())
      .pipe(es.map((data, done) => {
        // console.error(data);
        if (data.scores) {
          scoreCache[data.fileId] = data.scores;
          done();
        } else {
          ids.push(data._id);
          fileIds.push(data.fileId);
          const file = path.join(dataPath, `core-${data._id}.bson`);
          coreProfiles.push(file);
          fs.writeFile(file, bson.serialize(data.analysis.core.variance), done);
        }
      }))
      .on('error', reject)
      .on('end', () => {
        const [ durationS, durationNs ] = process.hrtime(startTime);
        const duration = Math.round(durationS * 1000 + durationNs / 1e6);
        console.error('profiles saved', duration);
        resolve({ ids, coreProfiles });
      });
  });
}

function compareProfiles(input, done) {
  const args = [
    'compare-bson-data.js',
    ...input.map(index => path.join(dataPath, `core-${ids[index]}.bson`)),
  ];

  const startTime = process.hrtime();
  const child = spawn('node', args);

  const buffer = [];
  child.stdout.on('data', (data) => {
    buffer.push(data.toString());
  });

  const error = [];
  child.stderr.on('data', (data) => {
    error.push(data);
  });

  child.on('close', (code) => {
    const [ durationS, durationNs ] = process.hrtime(startTime);
    const duration = Math.round(durationS * 1000 + durationNs / 1e6);
    console.error(input.length, duration, duration / input.length);
    if (code === 0) {
      done(null, buffer.join('').trim().split('\t'));
    } else {
      if (child.stderr.readable) {
        child.stderr.on('close', () => {
          done({ code, error: error.join('\n') });
        });
      } else {
        done({ code, error: error.join('\n') });
      }
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
    const startTime = process.hrtime();

    mapLimit(
      comparisons.reverse(),
      limit,
      (input, done) => {
        compareProfiles(input, (err, vector) => {
          if (err) return done(err);
          outputScores(input, vector);
          for (let i = 0; i < vector.length; i++) {
            matrix[input[0]][input[i + 1]] = vector[i];
          }
          return done(null);
        });
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          const [ durationS, durationNs ] = process.hrtime(startTime);
          const duration = Math.round(durationS * 1000 + durationNs / 1e6);
          console.error('all comparisons', duration);
          resolve(matrix);
        }
      }
    );
  });
}

function buildTree(matrix) {
  const startTime = process.hrtime();
  const labels = ids;
  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(matrixFile);
    outStream.on('error', reject);
    outStream.write('ID\t');
    outStream.write(labels.join('\t'));
    outStream.write('\n');
    for (let index = 0; index < matrix.length; index++) {
      outStream.write(labels[index]);
      outStream.write('\t');
      outStream.write(matrix[index].join('\t'));
      outStream.write('\n');
    }
    outStream.end((err) => {
      if (err) reject(err);
      const [ durationS, durationNs ] = process.hrtime(startTime);
      const duration = Math.round(durationS * 1000 + durationNs / 1e6);
      console.error('write matrix file', duration);
      resolve(matrixFile);
    });
  });
}

Promise.resolve(process.argv.length === 2 ? process.stdin : fs.createReadStream(process.argv[2]))
  .then(saveProfiles)
  .then(buildMatrix)
  .then(buildTree)
  .catch(err => console.error('ERROR') || console.error(err));
