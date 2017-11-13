const es = require('event-stream');
const bs = require('bson-stream');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const mapLimit = require('async/mapLimit');

const dataPath = '.';
const matrixFile = 'matrix.csv';

const limit = process.env.WGSA_WORKERS || 8;

function saveProfiles(stream) {
  return new Promise((resolve, reject) => {
    const ids = [];
    const coreProfiles = [];

    stream
      .pipe(new bs())
      .pipe(es.map((data, done) => {
        delete data.analysis.core.__v;
        const coreProfile = data.analysis.core;
        ids.push(data._id.toString());
        const file = path.join(dataPath, `core-${data._id}.json`);
        coreProfiles.push(file);
        fs.writeFile(file, JSON.stringify(coreProfile), done);
      }))
      .on('error', reject)
      .on('end', () => resolve({ ids, coreProfiles }));
  });
}

function compareProfiles(item, coreProfiles, done) {
  const child = spawn('python', [ 'distance-score.py', item, ...coreProfiles ]);

  const buffer = [];

  child.stdout.on('data', (data) => {
    buffer.push(data);
  });

  child.on('close', (code) => {
    if(code === 0) {
      done(null, buffer);
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

function compareProfile(coreProfiles, item, done) {
  const index = coreProfiles.indexOf(item);
  if (index > 0) {
    compareProfiles(item, coreProfiles.slice(0, index), done);
  } else {
    done(null, []);
  }
}

function pairProfiles(coreProfiles) {
  const pairs = [];
  for (var index = 0; index < coreProfiles.length / 2; index++) {
    const coIndex = coreProfiles.length - 1 - index;
    if (index === coIndex) {
      pairs.push([ coreProfiles[index] ]);
    } else {
      pairs.push([
        coreProfiles[index],
        coreProfiles[coreProfiles.length - 1 - index],
      ]);
    }
  }
  return pairs;
}

function flatenPairedResults(results) {
  const matrix = [];
  for (var index = 0; index < results.length; index++) {
    matrix.push(results[index][0]);
  }
  for (var index = results.length - (results[results.length - 1].length === 1 ? 2 : 1); index >= 0; index--) {
    matrix.push(results[index][1]);
  }
  return matrix;
}

function buildMatrix({ ids, coreProfiles }) {
  return new Promise((resolve, reject) => {
    mapLimit(
      pairProfiles(coreProfiles),
      limit,
      (pair, done) => {
        compareProfile(coreProfiles, pair[0], (err0, vector0) => {
          if (err0) return done(err0);
          if (pair.length === 1) return done(null, [ vector0 ]);
          compareProfile(coreProfiles, pair[1], (err1, vector1) => {
            if (err1) return done(err1);
            done(null, [ vector0, vector1 ]);
          });
        });
        // const index = coreProfiles.indexOf(item);
        // if (index > 0) {
        //   compareProfiles(item, coreProfiles.slice(0, index), done);
        // } else {
        //   done(null, []);
        // }
      },
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({ ids, matrix: flatenPairedResults(results) });
        }
      }
    );
  });
}

function buildTree({ ids, matrix }) {
  const labels = ids;
  return new Promise((resolve, reject) => {
    const inputFile = fs.createWriteStream(matrixFile);
    inputFile.write('ID\t');
    inputFile.write(labels.join('\t'));
    inputFile.write('\n');
    for (let index = 0; index < matrix.length; index++) {
      inputFile.write(labels[index]);
      inputFile.write('\t');
      for(const buffer of matrix[index]) {
        inputFile.write(buffer, 'utf8');
      }
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
