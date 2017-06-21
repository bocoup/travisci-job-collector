'use strict';

class HTTPError extends Error {
  constructor(statusCode, url) {
    super(`Unexpected HTTP response status ${ statusCode } for ${ url }`);

    this.statusCode = statusCode;
    this.url = url;
  }
}

module.exports = HTTPError;
