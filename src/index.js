'use strict';
var path = require('path');

var lookup = require('./lookup');

// TODO: Parse these values from the command line
var args = {
    repo: 'w3c/web-platform-tests',
    cacheDir: path.join(process.cwd(), 'request-cache'),
    prRange: '5920-6304'
  };

var options = { cacheDir: args.cacheDir  };

var [low, high] = args.prRange.split('-')
  .map((num) => parseInt(num, 10));
var prIds = Array.from(new Array(high + 1))
  .filter((_, idx) => idx >= low)
  .map((_, idx) => low + idx);

prIds.reduce(function(current, next, idx) {
    var progressPct = (100 * idx / prIds.length);
    var progressStr = `PR #${ next } (${ progressPct.toFixed(2) }%)`;

    return current
      .then(() => console.log(progressStr))
      .then(() => getBuildData(args.repo, next));
  }, Promise.resolve())
  .then(() => console.log('Done.'))
  .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });

function getBuildData(repoId, prId) {
  var prUrl = `https://api.github.com/repos/${ repoId }/pulls/${ prId }`;

  return lookup(prUrl, options)
    .then((res) => lookup(res.statuses_url, options))
    .then((statuses) => statuses.map((status) => status.target_url))
    .then((urls) => urls.map((url) => (url.match(/builds\/([0-9]+)\?/) || [])[1]))
    .then((matches) => matches.filter((match) => !!match))
    .then((matches) => matches.filter((match, idx) => matches.indexOf(match) === idx))
    .then((ids) => Promise.all(ids.map((id) => lookup('https://api.travis-ci.org/builds/' + id, options))));
}
