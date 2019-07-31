const githubHelper = require('../helpers/github-helper');

function setLookup(req, res, next) {
  return githubHelper
    .getRepositoryFileList(req)
    .then(githubHelper.downloadFiles)
    .then(githubHelper.parseFiles)
    .then(sets => {
      req.sets = sets;
      next();
    })
    .catch(next);
}

module.exports = setLookup;
