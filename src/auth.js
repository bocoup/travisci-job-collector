'use strict';
var fs = require('fs');

var request = require('./request');

function read(fileName) {
  return new Promise((resolve, reject) => {
      fs.readFile(fileName, { encoding: 'utf-8' }, function(err, contents) {
          if (err) {
            reject(err);
          }
          resolve(contents);
        });
    });
}

function authenticate(name, pass) {
  var options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/authorizations',
      method: 'POST',
      auth: name + ':' + pass
    };
  var body = {
      note: 'Retrieving TravisCI build data.'
    };

  return request(options, body)
    .then((res) => {
        return res.token;
      });
}

function save(fileName, contents) {
  return new Promise((resolve, reject) => {
      fs.writeFile(fileName, contents, function(err) {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
    });
}

function prompt(name) {
  process.stdout.write(name + ': ');

  return new Promise((resolve) => {
      process.stdin.resume();
      process.stdin.once('data', (chunk) => {
          resolve(String(chunk).trim());
          process.stdin.pause();
        });
    });
}

module.exports = function(fileName) {
  return read(fileName)
    .catch(() => {
        var ghUser;

        return prompt('GitHub.com username')
          .then((_ghUser) => ghUser = _ghUser)
          .then(() => prompt('GitHub.com password'))
          .then((ghPass) => authenticate(ghUser, ghPass))
          .then((token) => {
              return save(fileName, token)
                .then(() => token);
            });
      });
};
