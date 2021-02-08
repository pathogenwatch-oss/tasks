const BsonStream = require('bson-stream');
const fs = require('fs');

function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file,
      data,
      (error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      },
    );
  });
}  

async function readInput(readStream) {
  readStream.setEncoding("utf8");
  const newick = [];
  for await (const chunk of readStream) {
    newick.push(chunk);
  }

  return newick.join();
}

Promise.resolve(process.stdin)
  .then(readInput)
  .then((newick) => ({ newick }))
  .then(JSON.stringify)
  .then(console.log)
  .catch(console.error);
