const expectedKernelSize = 1755637;
const Bson = require('bson');
const fs = require('fs');
const compare = require('./compare');
const mapLimit = require('async/mapLimit');

const bson = new Bson();

const query = bson.deserialize(fs.readFileSync(process.argv[2]));

// for (let index = 3; index < process.argv.length; index++) {
//   const subject = bson.deserialize(fs.readFileSync(process.argv[index]));
//   // console.time('go compare')s;
//   const score = compare(expectedKernelSize, query, subject);
//   // console.timeEnd('go compare');
//   process.stdout.write(score.toString());
//   process.stdout.write('\t');
// }
// process.stdout.write('\n');

mapLimit(
  process.argv.slice(3),
  8,
  (file, done) => {
    fs.readFile(file, (err, data) => {
      if (err) done(err);
      const subject = bson.deserialize(data);
      const score = compare(expectedKernelSize, query, subject);
      done(null, score);
    });
  },
  (err, vector) => {
    if (err) {
      process.stderr.write(err);
      process.exit(1);
    } else {
      process.stdout.write(vector.join('\t'));
      process.stdout.write('\n');
    }
  }
);
