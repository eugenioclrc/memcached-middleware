const memjs = require('memjs');
const zlib = require('zlib');

function logOnErr(err) {
  if(err) {
    console.error(err);
  }
}

// req.originalUrl.split('?')[0];
module.exports = function(endpoint) {
  const memcached = memjs.Client.create(endpoint);

  return function timecacher(key, html, expires, gzip = true) {
    if (gzip) {
      zlib.gzip(html, { level: zlib.Z_BEST_COMPRESSION }, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
        memcached.set(key, result, {expires}, logOnErr);
      });
    } else {
      memcached.set(key, html, {expires}, logOnErr);
    }
  };
};
