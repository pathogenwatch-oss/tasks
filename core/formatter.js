function getMatches({ coreProfile }) {
	const matches = [];
	for (const id of Object.keys(coreProfile)) {
		for (const match of coreProfile[id].alleles) {
			matches.push({
				partial: match.full != true,
				reversed: match.qR[0] > match.qR[1],
				evalue: null,
				identity: null,
				query: {
					id: match.qId,
					start: match.qR[0],
					stop: match.qR[1],
				},
				reference: {
					id,
					start: match.rR[0],
					stop: match.rR[1],
					length: null,
				},
			});
		}
	}
	return matches;
}

function format(result) {
  return {
		summary: result.coreSummary,
		variance: result.varianceData,
		fp: {
			reference: result.fp.subTypeAssignment,
			size: result.fp.fingerprintSize,
		},
		matches: getMatches(result.coreProfile),
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
