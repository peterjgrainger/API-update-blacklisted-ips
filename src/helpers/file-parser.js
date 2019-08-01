const cidrRange = require('cidr-range');

const IP_ADDRESS_REGEX = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
const CIDR_ADDRESS_REGEX = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}/g;

function ipAddresses(file) {
  return file.contents.match(IP_ADDRESS_REGEX) || [];
}

function cidrToIpAddress(file) {
  const netsets = file.contents.match(CIDR_ADDRESS_REGEX);
  if (!netsets) return [];

  return netsets.reduce((sum, cidrAddress) => {
    return sum.concat(cidrRange(cidrAddress));
  }, []);
}

/**
 * Convert simple text into a list of IP addresses
 *
 * @param {array} files file objects containing ipAddresses and the source
 */
function parseFiles(files) {
  return files.map(file => ({
    ipAddresses: ipAddresses(file).concat(cidrToIpAddress(file)),
    source: file.source
  }));
}

module.exports = parseFiles;
