const request = require('supertest');
const redis = require('redis');
const fs = require('fs');
const app = require('../src/app');

describe('/webhook', () => {
  let event;
  let redisClient;

  beforeAll(() => {
    redisClient = redis.createClient();
  });

  beforeAll(() => {
    event = JSON.parse(fs.readFileSync('spec/github-push-event.json', 'utf8'));
  });

  it('github event should have the repository included', () => {
    expect(event.repository.url).toBe(
      'https://github.com/peterjgrainger/blacklisted-ips'
    );
  });

  it('replies with 200', done => {
    request(app)
      .post('/webhook')
      .send(event)
      .expect(200, done);
  });

  it('updates the blacklist with the feodo ipset list', done => {
    request(app)
      .post('/webhook')
      .send(event)
      .expect(200)
      .then(() => {
        redisClient.get('103.75.118.230', (err, reply) => {
          expect(reply).toBe('feodo.ipset');
          done();
        });
      })
      .catch(done);
  });
});
