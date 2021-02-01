/* eslint no-param-reassign: 0 */

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

function createJsonDocument(input) {
  return {
    sam: input,
  };
}

read(process.stdin)
.then(createJsonDocument)
.then(JSON.stringify)
.then(console.log)
.catch(e => {
  console.error(e);
  process.exit(1);
});
