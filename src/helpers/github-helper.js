const requestLibrary = require('request-promise');

const IP_ADDRESS_REGEX = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
// required defaults to contact github API
const request = requestLibrary.defaults({
  headers: {
    'User-Agent': 'peterjgrainger',
    Authorization: `token ${process.env.GITHUB_TOKEN}`
  }
});

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

/**
 * Convert simple text into a list of IP addresses
 *
 * @param {array} files file objects containing ipAddresses and the source
 */
function parseFiles(files) {
  return files.map(file => ({
    ipAddresses: file.contents.match(IP_ADDRESS_REGEX),
    source: file.source
  }));
}

module.exports = {
  parseFiles,
  getRepositoryFileList,
  downloadFiles
};
