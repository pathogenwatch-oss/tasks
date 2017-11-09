const es = require('event-stream');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const mapLimit = require('async/mapLimit');

const dataPath = '.';
const limit = 100;

function saveProfiles(stream) {
  return new Promise((resolve, reject) => {
    const ids = [];
    const coreProfiles = [];
    stream
      .pipe(es.split())
      .pipe(es.map((data, done) => {
        if (data.length > 1) {          
          const json = JSON.parse(data);
          ids.push(json._id);
          delete json.analysis.core.__v;
          // json.analysis.core.coreProfile.assemblyId = json._id;
          // json.analysis.core.coreSummary.assemblyId = json._id;
          const coreProfile = JSON.stringify(json.analysis.core);
          const file = path.join(dataPath, `${coreProfiles.length}_core.jsn`);
          coreProfiles.push(file);
          fs.writeFile(file, coreProfile, done);
        } else {
          done(null);
        }
      }))
      .on('error', reject)
      .on('end', () => resolve({ ids, coreProfiles }));
  });
}

function compareProfiles(item, coreProfiles, done) {
  const child = spawn('python', [ 'distance-score-snp.py', item, ...coreProfiles ]);
  
  const buffer = [];

  child.stdout.on('data', (data) => {
    buffer.push(data);
  });
  
  child.on('close', (code) => {
    if(code === 0) {
      done(null, buffer);
    } else {
      done(code);
    }
  });
}

function buildMatrix({ ids, coreProfiles }) {
  return new Promise((resolve, reject) => {
    mapLimit(
      coreProfiles, 
      limit, 
      (item, done) => {
        compareProfiles(item, coreProfiles, done);
      }, 
      (err, matrix) => {
        if (err) {
          reject(err);
        } else {
          resolve({ ids, matrix });
        }
      }
    );
  });
}

function buildTree({ ids, matrix }) {
  const labels = ids;
  // for (let index = 1000; index < 1000 + matrix.length; index++) {
  //   labels.push(`leaf${index}`);
  // }
  const matrixFile = 'matrix.csv';
  return new Promise((resolve, reject) => {
    const inputFile = fs.createWriteStream(matrixFile);
    inputFile.write('ID\t');  
    inputFile.write(labels.join('\t'));  
    inputFile.write('\n');  
    for (let index = 0; index < matrix.length; index++) {
      inputFile.write(labels[index]);  
      inputFile.write('\t');
      for(let buffer of matrix[index]) {
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
  .catch(console.error)