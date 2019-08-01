const requestLibrary = require('request-promise');

// required defaults to contact github API
const requestDefaults = {
  headers: {
    'User-Agent': 'peterjgrainger',
    Authorization: `token ${process.env.GITHUB_TOKEN}`
  }
};

const request = requestLibrary.defaults(requestDefaults);

/**
 * Download the raw text file
 *
 * @param {Object} file file reference from the contents API
 */
function downloadRawFile(file) {
  const options = {
    json: true,
    url: file.download_url,
    method: 'GET'
  };
  return request.get(options).then(contents => ({
    contents,
    source: file.name
  }));
}

/**
 * Filter only ipset or netset files and download the contents
 * of them all.
 *
 * @param {Array} files full repository file list
 */
function downloadFiles(files) {
  return Promise.all(
    files.filter(file => /(ipset|netset)/.test(file.name)).map(downloadRawFile)
  );
}

/**
 * To get the contents of the whole repository remove the placeholder.
 *
 * @param {Object} req express request
 */
function contentsUrl(req) {
  return req.body.repository.contents_url.replace('/{+path}', '');
}

/**
 * Use the github api to get the contents of the repository
 *
 * @param {Object} req express request
 */
function getRepositoryFileList(req) {
  return request.get({
    json: true,
    url: contentsUrl(req),
    method: 'GET'
  });
}

module.exports = {
  getRepositoryFileList,
  downloadFiles
};
