const rewire = require('rewire');

describe('src/middleware/ipaddress-lookup', () => {
  let middleware;
  let githubHelper;
  let fileParser;
  let req;
  let next;
  let list;
  let sets;
  let parsedFiles;

  beforeEach(() => {
    middleware = rewire('../../src/middleware/ipaddress-lookup.js');

    githubHelper = jasmine.createSpyObj('github-helper', [
      'getRepositoryFileList',
      'downloadFiles'
    ]);
    fileParser = jasmine.createSpy('file-parser');
    next = jasmine.createSpy('next');

    req = {};
    list = ['file-list'];
    sets = ['sets'];
    parsedFiles = 'parsedFiles';

    githubHelper.getRepositoryFileList
      .withArgs(req)
      .and.returnValue(Promise.resolve(list));

    githubHelper.downloadFiles.and.returnValue(Promise.resolve(sets));

    fileParser.and.returnValue(parsedFiles);

    /* eslint-disable no-underscore-dangle */
    middleware.__set__('githubHelper', githubHelper);
    middleware.__set__('fileParser', fileParser);
    /* eslint-enable no-underscore-dangle */
  });

  describe('successful processing', () => {
    beforeEach(done => {
      middleware(req, {}, next)
        .then(done)
        .catch(done);
    });

    it('calls next with no arguments', () => {
      expect(next).toHaveBeenCalledWith();
    });

    it('gets the repository file list', () => {
      expect(githubHelper.getRepositoryFileList).toHaveBeenCalledWith(req);
    });

    it('calls download files with the file list', () => {
      expect(githubHelper.downloadFiles).toHaveBeenCalledWith(list);
    });

    it('adds the sets to the request', () => {
      expect(req.sets).toBe(parsedFiles);
    });
  });

  describe('unsuccessfull processing', () => {
    it('calls next with error from getRepositoryFileList', done => {
      const error = new Error();
      githubHelper.getRepositoryFileList.and.throwError(error);

      middleware(req, {}, next)
        .then(() => done('should have failed'))
        .catch(() => {
          expect(next).toHaveBeenCalledWith(error);
        });
    });

    it('calls next with error from downloadFiles', done => {
      const error = new Error();
      githubHelper.downloadFiles.and.throwError(error);

      middleware(req, {}, next)
        .then(() => done('should have failed'))
        .catch(() => {
          expect(next).toHaveBeenCalledWith(error);
        });
    });
  });
});
