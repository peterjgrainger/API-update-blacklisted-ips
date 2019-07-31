const redis = require('redis');

// Reusable client
let client;

const clientConfiguration = {
  port: '6379',
  host: process.env.REDIS_HOST || 'localhost'
};

/**
 * Attach the redis client to the request to be used by the routes
 */
function redisMiddleware(req, res, next) {
  if (client && client.connected) {
    req.redisClient = client;
    next();
  } else {
    client = redis.createClient(clientConfiguration);

    client.on('ready', () => {
      req.redisClient = client;
      next();
    });

    client.on('error', error => {
      client = false;
      next(error);
    });
  }
}

module.exports = redisMiddleware;
