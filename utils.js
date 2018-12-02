const crypto = require('crypto');

function getMd5(url) {
  const fullurlNoparams = url.split('?')[0];

  return crypto.createHash('md5')
  .update(fullurlNoparams).digest('hex');
}

function cleanHttp(host) {
  // elimina el http:// o https://
  const s = host.split('//');
  if (s.length > 1) {
    s.shift();
  }
  return s.join('//');
}

module.exports = { getMd5, cleanHttp };
