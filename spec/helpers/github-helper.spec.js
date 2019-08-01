const rewire = require('rewire');

describe('src/helpers/github-helper', () => {
  let githubHelper;
  let requestMock;
  let req;
  let repositoryContents;
  let fileContents;
  let formattedFileContents;
  const contentsUrl =
    'https://api.github.com/repos/peterjgrainger/blacklisted-ips/contents';
  const downloadUrl =
    'https://raw.githubusercontent.com/peterjgrainger/blacklisted-ips/master/feodo.ipset';

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
        name: 'feodo.ipset',
        path: 'feodo.ipset',
        sha: 'f7dd6ec4ebca331bab18aad479c31f40eaf9c550',
        size: 71,
        url:
          'https://api.github.com/repos/peterjgrainger/blacklisted-ips/contents/feodo.ipset?ref=master',
        html_url:
          'https://github.com/peterjgrainger/blacklisted-ips/blob/master/feodo.ipset',
        git_url:
          'https://api.github.com/repos/peterjgrainger/blacklisted-ips/git/blobs/f7dd6ec4ebca331bab18aad479c31f40eaf9c550',
        download_url: downloadUrl,
        type: 'file',
        _links: {
          self:
            'https://api.github.com/repos/peterjgrainger/blacklisted-ips/contents/feodo.ipset?ref=master',
          git:
            'https://api.github.com/repos/peterjgrainger/blacklisted-ips/git/blobs/f7dd6ec4ebca331bab18aad479c31f40eaf9c550',
          html:
            'https://github.com/peterjgrainger/blacklisted-ips/blob/master/feodo.ipset'
        }
      }
    ];

    fileContents = '1.1.1.1\n2.2.2.2';
    formattedFileContents = [
      {
        contents: fileContents,
        source: 'feodo.ipset'
      }
    ];

    const downloadOptions = {
      json: true,
      url: downloadUrl,
      method: 'GET'
    };

    requestMock.get
      .withArgs(downloadOptions)
      .and.returnValue(Promise.resolve(fileContents));

    const contentsOptions = {
      json: true,
      url: contentsUrl,
      method: 'GET'
    };

    requestMock.get
      .withArgs(contentsOptions)
      .and.returnValue(Promise.resolve(repositoryContents));

    githubHelper = rewire('../../src/helpers/github-helper.js');
    // eslint-disable-next-line no-underscore-dangle
    githubHelper.__set__('request', requestMock);
  });

  it('returns a list of all the files in a repository', done => {
    githubHelper
      .getRepositoryFileList(req)
      .then(result => {
        expect(result).toBe(repositoryContents);
      })
      .then(done)
      .catch(done);
  });

  it('downloads each raw file from github', done => {
    githubHelper
      .downloadFiles(repositoryContents)
      .then(result => {
        expect(result).toEqual(formattedFileContents);
      })
      .then(done)
      .catch(done);
  });
});
