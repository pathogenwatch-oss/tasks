function mergeMatches(paar = {}, snpar = {}) {
  const matches = [];
  for (const { resistanceSetName, agents, elementIds } of paar.completeResistanceSets) {
    for (const elementId of elementIds) {
      for (const match of (paar.blastMatches[elementId] || [])) {
        matches.push({
          agents,
          id: resistanceSetName,
          source: 'WGSA_PAAR',
          type: 'CDS',
          reversed: match.reversed,
          evalue: match.evalue,
          identity: match.percentIdentity,
          library: {
            stop: match.librarySequenceStop,
            start: match.librarySequenceStart,
            length: match.librarySequenceLength,
            id: match.librarySequenceId,
          },
          query: {
            stop: match.querySequenceStop,
            start: match.querySequenceStart,
            length: match.querySequenceLength,
            id: match.querySequenceId,
          },
        });
      }
    }
  }
  for (const { resistanceSetName, agents } of snpar.completeSets) {
    for (const { searchStatistics, snpResistanceElements } of snpar.blastMatches) {
      if (resistanceSetName.startsWith(searchStatistics.librarySequenceId)) {
        matches.push({
          id: resistanceSetName,
          source: 'WGSA_SNPAR',
          type: 'CDS',
          reversed: searchStatistics.reversed,
          evalue: searchStatistics.evalue,
          identity: searchStatistics.percentIdentity,
          library: {
            stop: searchStatistics.librarySequenceStop,
            start: searchStatistics.librarySequenceStart,
            length: searchStatistics.librarySequenceLength,
            id: searchStatistics.librarySequenceId,
          },
          query: {
            stop: searchStatistics.querySequenceStop,
            start: searchStatistics.querySequenceStart,
            length: searchStatistics.querySequenceLength,
            id: searchStatistics.querySequenceId,
          },
        });
        for (const { causalMutations, resistanceMutation } of snpResistanceElements) {
          for (const mutation of causalMutations) {
            matches.push({
              agents,
              id: searchStatistics.querySequenceId,
              source: 'WGSA_SNPAR',
              type: 'point_mutation',
              reversed: searchStatistics.reversed,
              queryLocation: mutation.queryLocation,
              referenceLocation: mutation.referenceLocation,
              name: resistanceMutation.name,
              libraryStart: searchStatistics.librarySequenceStart,
            });
          }
        }
      }
    }
  }
  return matches;
}

function getMechanismsByAgent(completeSets, partialSets) {
  const mechanismsByAgent = {};

  for (const { elementIds, effect, agents } of completeSets) {
    for (const element of elementIds) {
      for (const agent of agents) {
        const mechanisms = mechanismsByAgent[agent] || [];
        mechanisms.push({ name: element, effect })
        mechanismsByAgent[agent] = mechanisms;
      }
    }
  }
  for (const { elementIds, effect, agents } of partialSets) {
    for (const element of elementIds) {
      for (const agent of agents) {
        const mechanisms = mechanismsByAgent[agent] || [];
        mechanisms.push({ name: element, effect })
        mechanismsByAgent[agent] = mechanisms;
      }
    }
  }

  return mechanismsByAgent;
}

function formatResistanceProfile({ resistanceProfile, paarResult, snparResult }) {
  const paar = getMechanismsByAgent(
    paarResult.completeResistanceSets,
    paarResult.partialResistanceSets
  );
  const snp = getMechanismsByAgent(
    snparResult.completeSets,
    snparResult.partialSets
  );

  const profile = [];
  for (const { agent, resistanceState } of resistanceProfile) {
    profile.push({
      agent: agent.name,
      name: agent.fullName,
      type: agent.type,
      state: resistanceState,
      genes: paar[agent.name],
      snps: snp[agent.name],
    });
  }
  return profile;
}

function format(result) {
  return {
    profile: formatResistanceProfile(result),
    matches: mergeMatches(result.paarResult, result.snparResult),
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
