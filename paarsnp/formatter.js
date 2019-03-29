function format(result) {
  return {
    antibiotics: result.resistanceProfile ?
    result.resistanceProfile.map(
      ({ agent, resistanceState, resistanceSets }) => ({
        name: agent.name,
        fullName: agent.fullName,
        state: resistanceState,
        mechanisms: resistanceSets.reduce(
          (memo, _) => memo.concat(_.elementIds), []
        ),
      })
    ) : [],
    paar: result.paarElementIds || [],
    snp: result.snparElementIds || [],
    matches: result.matches.concat(result.variantMatches),
    library: result.library
  };
}

function read(stdin) {
  var ret = '';

  return new Promise(function (resolve) {
    if (stdin.isTTY) {
      resolve(ret);
      return;
    }

    stdin.setEncoding('utf8');

    stdin.on('readable', function () {
      var chunk;

      while ((chunk = stdin.read())) {
        ret += chunk;
      }
    });

    stdin.on('end', function () {
      resolve(ret);
    });
  });
};

read(process.stdin)
  .then(JSON.parse)
  .then(format)
  .then(JSON.stringify)
  .then(console.log)
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
