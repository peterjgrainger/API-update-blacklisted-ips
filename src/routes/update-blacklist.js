const redisHelper = require('../helpers/redis-helper');

function updateBlacklist(req, res, next) {
  req.redisClient.keys('*', (error, keys) => {
    if (error) {
      next(error);
    } else {
      redisHelper
        .updateKeys(req, keys)
        .then(result => res.send(result))
        .then(next)
        .catch(next);
    }
  });
}

module.exports = updateBlacklist;
