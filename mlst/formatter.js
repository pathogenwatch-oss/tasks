const { createReadStream } = require('fs');

function format(result_obj) {
  const { st, code, scheme, host, type, hostPath, schemeId, genes, alleles, schemeName, schemeSize,  raw_code: rawCode} = result_obj;
  const formattedAlleles = [];
  const matches = [];

  for (const gene of genes) {
    if (!(gene in alleles)) {
        formattedAlleles.push({gene, hit: ""})
        continue;
    }
    formattedAlleles.push({
      gene,
      hit: alleles[gene].id,
    });
    matches.push(alleles[gene]);
  }

  return {
    st,
    code,
    scheme,
    schemeName,
    hostPath,
    rawCode,
    schemeId,
    source: host,
    alleles: formattedAlleles,
    matches,
    schemeSize,
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
}

read(process.stdin)
// read(createReadStream('test.json'))
  .then(JSON.parse)
  .then(format)
  .then(JSON.stringify)
  .then(console.log)
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
