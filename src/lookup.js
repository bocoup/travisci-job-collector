'use strict';
var fs = require('fs');
var https = require('https');
var path = require('path');
var urlParse = require('url').parse;

function readFile(name) {
  return new Promise(function(resolve, reject) {
    fs.readFile(name, { encoding: 'utf-8' }, (err, contents) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          resolve(JSON.parse(contents));
        } catch (err) {
          reject(err);
        }
      });
    });
}

function writeFile(name, content) {
  return new Promise(function(resolve, reject) {
      var json;

      try {
        json = JSON.stringify(content, null, '  ');
      } catch (err) {
        reject(err);
        return;
      }

      fs.writeFile(name, json, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
    });
}

function request(url) {
  return new Promise(function(resolve, reject) {
      var options = urlParse(url);
      var request;

      options.headers = {'User-Agent': 'Node.js'};

      request = https.get(options, (res) => {
          var body = '';

          if (res.statusCode !== 200) {
            reject(
                new Error('Unexpected HTTP response status: ' + res.statusCode)
              );
            return;
          }

          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
             try {
               resolve(JSON.parse(body));
             } catch (err) {
               reject(err);
             }
           });
        });

      request.on('error', reject);
    });
}

module.exports = function(url, options) {
  var cacheDir = options && options.cacheDir || __dirname;
  var fileName;

  if (typeof url !== 'string') {
    return Promise.reject('url not a string');
  }
  if (url.indexOf('_') > -1) {
    return Promise.reject('URL may not contain an underscore');
  }

  fileName = path.join(cacheDir, url.replace(/\//g, '_'));

  return readFile(fileName)
    .catch(() => {
        return request(url)
          .then((content) => {
              return writeFile(fileName, content)
                .then(() => content);
            });
      });
};
