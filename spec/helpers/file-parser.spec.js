const fileParser = require('../../src/helpers/file-parser');

describe('src/helpers/file-parser', () => {
  let fileContents;
  let formattedFileContents;

  beforeEach(() => {
    fileContents = '1.1.1.1\n2.2.2.2';

    formattedFileContents = [
      {
        contents: fileContents,
        source: 'feodo.ipset'
      }
    ];
  });

  it('parses ipset files', () => {
    const parsedFiles = fileParser(formattedFileContents);

    expect(parsedFiles).toEqual([
      {
        ipAddresses: ['1.1.1.1', '2.2.2.2'],
        source: 'feodo.ipset'
      }
    ]);
  });

  it('parses range IP addresses', () => {
    const rangeIpAddresses = [
      {
        contents: '14.225.3.0/24\n37.49.227.0/24',
        source: 'dshield.netset'
      }
    ];
    const parsedFiles = fileParser(rangeIpAddresses);

    expect(parsedFiles[0].ipAddresses.length).toEqual(514);
  });
});
