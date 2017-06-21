'use strict';
var https = require('https');
var urlParse = require('url').parse;

var HTTPError = require('./http-error');

module.exports = function request(url) {
  return new Promise(function(resolve, reject) {
      var options = urlParse(url);
      var request;

      options.headers = {'User-Agent': 'Node.js'};

      request = https.get(options, (res) => {
          var body = '';

          if (res.statusCode !== 200) {
            reject(
                new HTTPError(res.statusCode, url)
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
};
