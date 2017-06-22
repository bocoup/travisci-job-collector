'use strict';
var path = require('path');

var auth = require('./auth');
var formatCSV = require('./format-csv');
var getData = require('./get-data');

// TODO: Parse these values from the command line
var args = {
    cacheDir: path.join(process.cwd(), 'request-cache'),
    prRange: '5920-6304',
    repo: 'w3c/web-platform-tests',
    tokenFile: path.join(process.cwd(), '.gh-token')
  };

try {
  let replay = require('replay');
  replay.fixtures = args.cacheDir;
  replay.mode = 'record';
} catch (_) {}

var [low, high] = args.prRange.split('-')
  .map((num) => parseInt(num, 10));
var prIds = Array.from(new Array(high + 1))
  .filter((_, idx) => idx >= low)
  .map((_, idx) => low + idx);

auth(args.tokenFile)
  .then((token) => getData(token, args.repo, prIds))
  .then((results) => {
      console.log(formatCSV(results));
    })
  .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
