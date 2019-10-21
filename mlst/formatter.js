const fs = require('fs');

function getSource(url) {
  if (/pubmlst\.org/.test(url)) return 'PubMLST';
  if (/pasteur\.fr/.test(url)) return 'Pasteur';
  if (/warwick\.ac\.uk/.test(url)) return 'EnteroBase';
  if (/cgmlst\.org/.test(url)) return 'Ridom';
  if (/ngstar/.test(url)) return 'Public Health Agency of Canada';
  return url;
}

function format({ st, url, genes, alleles, schemeSize }) {
  const formattedAlleles = [];
  const matches = [];

  for (const gene of genes) {
    const hits = alleles[gene];
    formattedAlleles.push({
      gene,
      hits: hits.map(_ => _.id),
    });
    for (const hit of hits) {
      matches.push(Object.assign({ gene }, hit));
    }
  }

  return {
    st,
    url,
    source: getSource(url),
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
