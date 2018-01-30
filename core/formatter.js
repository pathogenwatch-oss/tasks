/* eslint no-param-reassign: 0 */

const formatProfile = require('./formatProfile');

function formatCore(result) {
  return {
    summary: result.coreSummary,
    fp: {
      reference: result.fp.subTypeAssignment,
      size: result.fp.fingerprintSize,
    },
    profile: formatProfile(result),
  };
}

function read(stdin) {
  let ret = '';

  return new Promise((resolve) => {
    if (stdin.isTTY) {
      resolve(ret);
      return;
    }

    stdin.setEncoding('utf8');

    stdin.on('readable', () => {
      let chunk;
      while ((chunk = stdin.read())) {
        ret += chunk;
      }
    });

    stdin.on('end', () => {
      resolve(ret);
    });
  });
}

read(process.stdin)
.then(JSON.parse)
.then(formatCore)
.then(JSON.stringify)
.then(console.log)
.catch(e => {
  console.error(e);
  process.exit(1);
});

module.exports.formatProfile = formatProfile;
