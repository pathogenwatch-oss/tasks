const es = require('event-stream');
const Bson = require('bson');
const fs = require('fs');
const path = require('path');

const bson = new Bson();

let index = 0;

process.stdin
  .pipe(es.split())
  .pipe(
    es.map((data, done) => {
      if (data.length > 0) {
        const core = JSON.parse(data);
        const doc = {
          _id: `GENOME_${++index}`,
          analysis: {
            core,
          },
        };
        process.stdout.write(
          bson.serialize(doc)      
        );
      }
      done(null);
    })
  )
  .on('error', err => {
    console.error(err);
    process.exit(1);
  })
  .on('end', () => {
    process.exit(0);
  });
