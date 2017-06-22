'use strict';
var productRe = /^#(.*)#$/m;

module.exports = function(results) {
  return results.map((result) => {
      return result.comments
        .filter((comment) =>  comment.user.login === 'w3c-bots')
        .map((comment) => [
            result.pullRequest.number,
            result.pullRequest.created_at,
            comment.created_at,
            comment.body.match(productRe)[1].trim()
          ].join(','));
    })
    .reduce((flattened, comments) => flattened.concat(comments), [])
    .join('\n');
};
