const FIVE_MINUTES = 60 * 5;

/**
 * Use batch commands to expire all keys first
 * then update the keys. Updating the keys overrides
 * the expire. This will effectively delete the
 * keys after a delay
 *
 * @param {Object} req express request
 * @param {Array} keys list of redis keys
 */
function updateKeys(req, keys) {
  return new Promise((resolve, reject) => {
    const multi = req.redisClient.multi();

    // Expire all keys in 5 minutes
    keys.forEach(key => {
      multi.expire(key, FIVE_MINUTES);
    });

    // Add all IP addresses
    req.sets.forEach(set => {
      set.ipAddresses.forEach(ipAddress => {
        multi.set(ipAddress, set.source);
      });
    });

    // Execute all commands
    multi.exec(error => {
      if (error) {
        reject(error);
      } else {
        resolve('Keys Updated');
      }
    });
  });
}

module.exports = {
  updateKeys
};
