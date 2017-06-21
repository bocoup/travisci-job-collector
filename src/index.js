'use strict';
var path = require('path');
var replay = require('replay');
var parseUrl = require('url').parse;

var request = require('./request');
var auth = require('./auth');

// TODO: Parse these values from the command line
var args = {
    cacheDir: path.join(process.cwd(), 'request-cache'),
    prRange: '5920-6304',
    repo: 'w3c/web-platform-tests',
    tokenFile: path.join(process.cwd(), '.gh-token')
  };

replay.fixtures = args.cacheDir;

var [low, high] = args.prRange.split('-')
  .map((num) => parseInt(num, 10));
var prIds = Array.from(new Array(high + 1))
  .filter((_, idx) => idx >= low)
  .map((_, idx) => low + idx);

auth(args.tokenFile)
  .then((token) => {
      return prIds.reduce(function(current, next, idx) {
          var progressPct = 100 * idx / prIds.length;
          var progressStr = `PR #${ next } (${ progressPct.toFixed(2) }%)`;

          return current
            .then(() => console.log(progressStr))
            .then(() => getBuildData(args.repo, token, next))
            .catch((err) => {
                // GitHub.com assigns identifiers to pull requests and issues using a
                // single counter, so not all resources in the provided range may
                // exist.
                if (err && err.statusCode === 404 && /\/pulls\//.test(err.url)) {
                  return;
                }

                throw err;
              });
        }, Promise.resolve())
        .then(() => console.log('Done.'));
    })
  .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });

function getBuildData(repoId, token, prId) {
  var prUrl = `https://api.github.com/repos/${ repoId }/pulls/${ prId }`;
  function ghRequest(url) {
    var options = parseUrl(url);
    options.method = 'GET';
    options.headers = { Authorization: 'token ' + token };

    return request(options);
  }

  return ghRequest(prUrl)
    .then((res) => ghRequest(res.statuses_url))
    .then((statuses) => statuses.map((status) => status.target_url))
    .then((urls) => urls.map((url) => (url.match(/builds\/([0-9]+)\?/) || [])[1]))
    .then((matches) => matches.filter((match) => !!match))
    .then((matches) => matches.filter((match, idx) => matches.indexOf(match) === idx))
    .then((ids) => Promise.all(ids.map((id) => request('https://api.travis-ci.org/builds/' + id))));
}
