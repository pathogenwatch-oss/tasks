const fs = require('fs');
const path = require('path');
const Bson = require('bson');

const bson = new Bson();

// for (let index = 2; index < process.argv.length; index++) {
//   const element = process.argv[index];
//   const data = fs.readFileSync(element, 'utf8');
//   const core = JSON.parse(data);
//   fs.writeFileSync(
//     element.replace('.core.json', '.vd.json'),
//     JSON.stringify(core.varianceData)
//   );
// }

const coreFile = process.argv[2];
const jsonFile = process.argv[3];
const bsonFile = process.argv[4];

// console.log({ coreFile, jsonFile, bsonFile });

const data = fs.readFileSync(coreFile, 'utf8');
const core = JSON.parse(data);
fs.writeFileSync(
  jsonFile,
  JSON.stringify(core.varianceData)
);
fs.writeFileSync(
  bsonFile,
  bson.serialize(core.varianceData)
);
