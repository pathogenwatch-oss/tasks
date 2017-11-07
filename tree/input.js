const es = require('event-stream');
const fs = require('fs');

process.stdin
  .pipe(es.split())
  .pipe(es.map((data, done) => {
    if (data.length > 1) {
      const json = JSON.parse(data);
      delete json.analysis.core.__v;
      json.analysis.core.coreProfile.assemblyId = json._id;
      json.analysis.core.coreSummary.assemblyId = json._id;
      fs.writeFile(
        `/data/${json._id}_core.jsn`,
        JSON.stringify(json.analysis.core),
        done
      );
    } else {
      done(null);
    }
  }))
  .on('error', console.error)
  .on('end', () => console.error('end'));
