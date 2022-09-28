const customUrls = {
  470: {
    mlst: 'https://pubmlst.org/bigsdb?db=pubmlst_abaumannii_oxford_seqdef',
    mlst2: 'https://pubmlst.org/bigsdb?db=pubmlst_abaumannii_pasteur_seqdef'
  }
}

function getCustomURL(speciesId, task) {
  if (speciesId in customUrls && task in customUrls[speciesId]) {
    return customUrls[speciesId][task];
  }
  return null;
}

const customSources = {
  666: {
    mlst: 'Non-O1/O139',
    mlst2: 'O1/O139',
  },
  470: {
    mlst: 'Oxford',
    mlst2: 'Pasteur',
  },
};

function getCustomSource(speciesId, task) {
  if (speciesId in customSources && task in customSources[speciesId]) {
    return customSources[speciesId][task];
  }
  return null;
}

function getSource(url) {
  if (/pubmlst\.org/.test(url)) return 'PubMLST';
  if (/pasteur\.fr/.test(url)) return 'Pasteur';
  if (/warwick\.ac\.uk/.test(url)) return 'EnteroBase';
  if (/cgmlst\.org/.test(url)) return 'Ridom';
  if (/ngstar/.test(url)) return 'Public Health Agency of Canada';
  return url;
}

function format({ st, code, scheme, url, genes, alleles, schemeSize }) {
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

  const speciesId = process.argv[2];
  const task = process.argv[3];

  return {
    st,
    code,
    scheme: scheme,
    url: getCustomURL(speciesId, task) || url,
    source: getCustomSource(speciesId, task) || getSource(url),
    alleles: task === 'cgmlst' ? undefined : formattedAlleles,
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
  .then(JSON.parse)
  .then(format)
  .then(JSON.stringify)
  .then(console.log)
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
