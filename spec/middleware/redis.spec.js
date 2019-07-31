const rewire = require('rewire');

describe('src/middleware/redis', () => {
  let redisMock;
  let redisClient;
  let redisMiddleware;

  beforeEach(() => {
    redisMiddleware = rewire('../../src/middleware/redis');
    redisClient = jasmine.createSpyObj('client-mock', ['on', 'connected']);
    redisMock = jasmine.createSpyObj('redis-mock', ['createClient']);
    redisMock.createClient.and.returnValue(redisClient);
    // eslint-disable-next-line no-underscore-dangle
    redisMiddleware.__set__('redis', redisMock);
  });

  it('creates a client', done => {
    redisMiddleware({}, {}, done);
    const callback = redisClient.on.calls.allArgs()[0][1];
    callback();

    expect(redisMock.createClient).toHaveBeenCalledWith({
      host: 'localhost',
      port: '6379'
    });
  });

  it('reuses client', done => {
    redisMiddleware({}, {}, () => {});
    redisClient.connected.and.returnValue(true);

    redisMiddleware({}, {}, done);

    expect(redisMock.createClient).toHaveBeenCalledTimes(1);
  });

  it('attaches the client to the request', () => {
    const req = {};
    redisMiddleware(req, {}, () => {});
    const callback = redisClient.on.calls.allArgs()[0][1];
    callback();

    expect(req.redisClient).toBe(redisClient);
  });

  it('responds with 500 on failure to connect to redis', () => {
    const error = new Error(
      'Redis connection to 127.0.0.1:6379 failed - connect ECONNREFUSED 127.0.0.1:6379'
    );

    const next = jasmine.createSpy('next-mock');
    redisMiddleware({}, {}, next);

    const callback = redisClient.on.calls.allArgs()[1][1];
    callback(error);

    expect(next).toHaveBeenCalledWith(error);
  });
});
