const githubHelper = require('../helpers/github-helper');
const fileParser = require('../helpers/file-parser');

function ipaddressLookup(req, res, next) {
  return githubHelper
    .getRepositoryFileList(req)
    .then(githubHelper.downloadFiles)
    .then(sets => {
      req.sets = fileParser(sets);
      next();
    })
    .catch(next);
}

module.exports = ipaddressLookup;
