'use strict';
var productRe = /^#(.*)#$/m;

module.exports = function(results) {
  var head = 'Pull request ID,Created at,Comment posted at,Product';
  var body = results.map((result) => {
      return result.comments
        .filter((comment) =>  comment.user.login === 'w3c-bots')
        .map((comment) => [
            result.pullRequest.number,
            new Date(result.pullRequest.created_at).getTime(),
            new Date(comment.created_at).getTime(),
            comment.body.match(productRe)[1].trim()
          ].join(','));
    })
    .reduce((flattened, comments) => flattened.concat(comments), [])
    .join('\n');

  return head + '\n' + body;
};
