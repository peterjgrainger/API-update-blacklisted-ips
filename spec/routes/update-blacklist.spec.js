const updateBlacklist = require('../../src/routes/update-blacklist');

describe('src/routes/update-blacklist', () => {
  let req;
  let redisClient;
  let res;
  let multi;
  let keys;
  let next;

  beforeEach(() => {
    multi = jasmine.createSpyObj('multi', ['expire', 'set', 'exec']);
    redisClient = jasmine.createSpyObj('redis-mock', ['multi', 'keys']);
    res = jasmine.createSpyObj('res-mock', ['status', 'send']);
    next = jasmine.createSpy('next-mock');
    req = {
      redisClient,
      sets: [
        {
          source: 'feoda.ipset',
          ipAddresses: ['1.1.1.1', '2.2.2.2']
        }
      ]
    };
    redisClient.multi.and.returnValue(multi);
    keys = ['1.1.1.1'];
  });

  describe('Keys updated successfully', () => {
    beforeEach(done => {
      updateBlacklist(req, res, next);

      const keyCallback = redisClient.keys.calls.allArgs()[0][1];
      keyCallback(undefined, keys);

      const execCallback = multi.exec.calls.allArgs()[0][0];
      execCallback();
      done();
    });

    it('sets the first ip address in redis', () => {
      expect(multi.set).toHaveBeenCalledWith('1.1.1.1', 'feoda.ipset');
    });

    it('calls next on success', () => {
      expect(next).toHaveBeenCalledWith(undefined);
    });

    it('expires all the keys', () => {
      expect(multi.expire).toHaveBeenCalledWith('1.1.1.1', 60 * 5);
    });
  });
});
