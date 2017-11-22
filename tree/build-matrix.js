const es = require('event-stream');
const bs = require('bson-stream');
const fs = require('fs');
const os = require('os');
const path = require('path');
const spawn = require('child_process').spawn;
const mapLimit = require('async/mapLimit');

const dataPath = '.';
const matrixFile = 'matrix.csv';

const limit = process.env.WGSA_WORKERS || 1;

let ids;
let fileIds = [];
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
      .pipe(new bs())
      .pipe(es.map((data, done) => {
        // console.error(data);
        if (data.genomes) {
          ids = data.genomes.map(x => x._id.toString());
          fileIds = data.genomes.map(x => x.fileId);
          done();
        } else if (data.scores) {
          scoreCache[data.fileId] = data.scores;
          done();
        } else {
          const { varianceData } = data.results;
          // fileIds.push(data.fileId);
          const file = path.join(dataPath, `core-${ids[fileIds.indexOf(data.fileId)]}.json`);
          coreProfiles.push(file);
          fs.writeFile(file, JSON.stringify(varianceData), done);
        }
      }))
      .on('error', reject)
      .on('end', () => {
        const [durationS, durationNs] = process.hrtime(startTime);
        const duration = Math.round(durationS * 1000 + durationNs / 1e6);
        console.error('profiles saved', duration);
        resolve({ ids, coreProfiles });
      });
  });
}

function compareProfiles(input, done) {
  const args = [
    '-XX:+UnlockExperimentalVMOptions',
    '-XX:+UseCGroupMemoryLimitForHeap',
    '-jar',
    '/core/compare-profiles.jar',
    '-s',
    '1280',
    '-f',
    input.map(index => path.join(dataPath, `core-${ids[index]}.json`)).join(','),
  ];

  const startTime = process.hrtime();
  const child = spawn('java', args);

  const buffer = [];
  child.stdout
    .pipe(es.split())
    .pipe(
      es.map((data, mapDone) => {
        if (data.length) {
          buffer.push(JSON.parse(data).s);
        }
        mapDone();
      })
    );

  child.on('close', (code) => {
    const [durationS, durationNs] = process.hrtime(startTime);
    const duration = Math.round(durationS * 1000 + durationNs / 1e6);
    console.error(input.length, duration, duration / input.length);
    if (code === 0) {
      done(null, buffer);
    } else {
      const error = [];
      child.stderr.on('data', (data) => {
        error.push(data.toString());
      });
      child.stderr.on('close', () => {
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
    const uncached = [i];
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
          done(null);
        });
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          const [durationS, durationNs] = process.hrtime(startTime);
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

Promise.resolve(process.stdin)
  .then(saveProfiles)
  .then(buildMatrix)
  .then(buildTree)
  .catch(err => console.error('ERROR') || console.error(err));