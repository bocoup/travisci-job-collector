'use strict';
var https = require('https');
var url = require('url');

var HTTPError = require('./http-error');

module.exports = function request(options, body) {
  return new Promise(function(resolve, reject) {
      var request;

      if (typeof options === 'string') {
        options = url.parse(options);
        options.method = 'GET';
      }

      options.headers = Object.assign({}, options.headers, {'User-Agent': 'Node.js'});

      request = https.request(options, (res) => {
          var body = '';

          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(
                new HTTPError(res.statusCode, url.format(options))
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

      if (body) {
        try {
          request.write(JSON.stringify(body));
        } catch (err) {
          reject(err);
          return;
        }
      }

      request.end();
    });
};
