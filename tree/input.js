const es = require('event-stream');
const fs = require('fs');

process.stdin
  .pipe(es.split())
  .on('data', data => {
    if (data.length > 1) {
      const json = JSON.parse(data);
      delete json.analysis.core.__v;
      json.analysis.core.coreProfile.assemblyId = json._id;
      json.analysis.core.coreSummary.assemblyId = json._id;
      fs.writeFileSync(
        `/data/${json._id}_core.jsn`,
        JSON.stringify(json.analysis.core)
      );
    }
  })
  .on('end', () => console.log('end'));
