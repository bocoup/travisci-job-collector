'use strict';
var parseUrl = require('url').parse;

var request = require('./request');

function getBuildData(repoId, token, prId) {
  var prUrl = `https://api.github.com/repos/${ repoId }/pulls/${ prId }`;
  var commentsUrl =`https://api.github.com/repos/${ repoId }/issues/${ prId }/comments`;
  var result = {};
  function ghRequest(url) {
    var options = parseUrl(url);
    options.method = 'GET';
    options.headers = { Authorization: 'token ' + token };

    return request(options);
  }

  return ghRequest(prUrl)
    .then((res) => {
        result.pullRequest = res;

        return ghRequest(res.statuses_url);
      })
    .then((statuses) => {
        result.statuses = statuses;
        return statuses.map((status) => status.target_url);
      })
    .then((urls) => urls.map((url) => (url.match(/builds\/([0-9]+)\?/) || [])[1]))
    .then((matches) => matches.filter((match) => !!match))
    .then((matches) => matches.filter((match, idx) => matches.indexOf(match) === idx))
    .then((ids) => Promise.all(ids.map((id) => request('https://api.travis-ci.org/builds/' + id))))
    .then((builds) => {
        result.builds = builds;
        return ghRequest(commentsUrl);
      })
    .then((comments) => {
        result.comments = comments;
        return result;
      });
}

module.exports = function(token, repo, prIds) {
  var results = [];

  return prIds.reduce(function(current, next, idx) {
      var progressPct = 100 * idx / prIds.length;
      var progressStr = `PR #${ next } (${ progressPct.toFixed(2) }%)`;

      return current
        .then(() => process.env.DEBUG && console.log(progressStr))
        .then(() => getBuildData(repo, token, next))
        .then((result) => results.push(result))
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
    .then(() => results);
};
