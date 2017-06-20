'use strict';
var path = require('path');

var lookup = require('./lookup');

var url = 'https://api.github.com/repos/w3c/web-platform-tests/statuses/e3a20f32ed973ef4117a5900929dd89fb6a42f5c';

lookup(url, { cacheDir: path.join(process.cwd(), 'request-cache') })
  .then(() => console.log('done'), (err) => console.error('uh oh', err));
