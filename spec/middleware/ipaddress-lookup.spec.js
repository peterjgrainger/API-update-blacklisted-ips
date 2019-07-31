const rewire = require('rewire');

describe('src/middleware/ipaddress-lookup', () => {
  let ipaddressMiddleware;
  let requestMock;
  let req;
  let repositoryContents;
  let fileContents;
  const contentsUrl =
    'https://api.github.com/repos/peterjgrainger/blacklisted-ips/contents';
  const downloadUrl =
    'https://raw.githubusercontent.com/peterjgrainger/blacklisted-ips/master/feoda.ipset';

  beforeEach(() => {
    requestMock = jasmine.createSpyObj('request-mock', ['get']);
    req = {
      body: {
        repository: {
          contents_url: contentsUrl
        }
      }
    };
    repositoryContents = [
      {
        name: 'feoda.ipset',
        path: 'feoda.ipset',
        sha: 'f7dd6ec4ebca331bab18aad479c31f40eaf9c550',
        size: 71,
        url:
          'https://api.github.com/repos/peterjgrainger/blacklisted-ips/contents/feoda.ipset?ref=master',
        html_url:
          'https://github.com/peterjgrainger/blacklisted-ips/blob/master/feoda.ipset',
        git_url:
          'https://api.github.com/repos/peterjgrainger/blacklisted-ips/git/blobs/f7dd6ec4ebca331bab18aad479c31f40eaf9c550',
        download_url: downloadUrl,
        type: 'file',
        _links: {
          self:
            'https://api.github.com/repos/peterjgrainger/blacklisted-ips/contents/feoda.ipset?ref=master',
          git:
            'https://api.github.com/repos/peterjgrainger/blacklisted-ips/git/blobs/f7dd6ec4ebca331bab18aad479c31f40eaf9c550',
          html:
            'https://github.com/peterjgrainger/blacklisted-ips/blob/master/feoda.ipset'
        }
      }
    ];

    fileContents = '1.1.1.1\n2.2.2.2';

    requestMock.get
      .withArgs(contentsUrl)
      .and.returnValue(Promise.resolve(repositoryContents));
    requestMock.get
      .withArgs(downloadUrl)
      .and.returnValue(Promise.resolve(fileContents));

    ipaddressMiddleware = rewire('../../src/middleware/ipaddress-lookup');
    // eslint-disable-next-line no-underscore-dangle
    ipaddressMiddleware.__set__('request', requestMock);
  });

  xit('adds a list of ips to the request', () =>
    ipaddressMiddleware(req, {}, () => {}).then(() => {
      expect(req.sets).toEqual([
        {
          source: 'feoda.ipset',
          ipAddresses: ['1.1.1.1', '2.2.2.2']
        }
      ]);
    }));

  xit('handles an empty file list', () => {
    requestMock.get.withArgs(contentsUrl).and.returnValue(Promise.resolve([]));
    return ipaddressMiddleware(req, {}, () => {}).then(() => {
      expect(req.sets).toEqual([]);
    });
  });

  xit('handles failures by calling next', () => {
    requestMock.get.and.throwError(new Error());
    return ipaddressMiddleware(req, {}, () => {}).catch(error => {
      expect(error).toEqual(new Error());
    });
  });
});
