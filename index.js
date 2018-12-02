const StreamLogger = require('./streamlogger');
const memcached = require('./cacher');
const { getMd5, cleanHttp } = require('./utils');

const instances = [];

function createMiddleware(endpoint) {
  // creo la conexion a memcache ENDPOINT
  // console.log(endpoint);
  const cacher = memcached(endpoint);

  return function cacherMiddleware (req, res, next) {
    let ended = false
    const listeners = []

    const stream = new StreamLogger();

    // add buffered listeners to stream
    addListeners(stream, stream.on, listeners)

    const _end = res.end
    const _on = res.on
    const _write = res.write
    res.on = function on (type, listener) {
      if (!listeners || type !== 'drain') {
        return _on.call(this, type, listener);
      }

      if (stream) {
        return stream.on(type, listener);
      }

      // buffer listeners for future stream
      listeners.push([type, listener])

      return res;
    }

    res.write = function write (chunk, encoding) {
      if (ended) {
        return false
      }

      if (stream) {
        stream.write(Buffer.from(chunk, encoding));
        return;
      }
      return _write.call(this, chunk, encoding);
    }

    res.end = function end (chunk, encoding) {
      if (ended) {
        return false
      }

      if (!stream) {
        return _end.call(this, chunk, encoding)
      }

      // mark ended
      ended = true

      // write Buffer for Node.js 0.8
      return chunk
        ? stream.end(Buffer.from(chunk, encoding))
        : stream.end()
    }


    res.on = function on (type, listener) {
      if (!listeners || type !== 'drain') {
        return _on.call(this, type, listener)
      }

      if (stream) {
        return stream.on(type, listener)
      }

      // buffer listeners for future stream
      listeners.push([type, listener])

      return this
    }
    // compression
    stream.on('data', function onStreamData (chunk) {
     if (_write.call(res, chunk) === false) {
       stream.pause()
     }
    })

    stream.on('end', function onStreamEnd () {
      if (res.statusCode !== 200 || !res.locals.CACHE) {
        _end.call(res);
        return;
      }

      const CFG = res.locals.CACHE;
      const originalUrl = req.originalUrl === '/' ? '' : req.originalUrl;
      const md5key = CFG.key || getMd5(CFG.url || cleanHttp(req.get('host') + originalUrl));

      console.log(
        md5key,
        cleanHttp(req.get('host') + originalUrl)
      );

      const value = stream.outputString();
      if (value && CFG.duration && CFG.duration > 0) {
        /**
         * esta porcion de codigo es para evitaru nbug raro en el cual se guarda
         * una respuesta erronea que solo dice GET,HEAD es probable que sea nginx
         * (como proxy interno de la app en node) que se satura o da timeout
         */
        const responseFirstChars = (value || '').trim().substring(0, 100);
        const testGETHEAD = /GET,HEAD/;
        if (!testGETHEAD.test(responseFirstChars)) {
          cacher(md5key, value, CFG.duration || 3600, true);
        }
      }

      _end.call(res)
    })

    _on.call(res, 'drain', function onResponseDrain () {
      stream.resume()
    })

    function addListeners (stream, on, listeners) {
      for (let i = 0; i < listeners.length; i++) {
        on.apply(stream, listeners[i])
      }
    }


    next();
  }
}

module.exports = function(endpoint) {
  // return require('./original')();
  if (!instances[endpoint]) {
    instances[endpoint] = createMiddleware(endpoint);
  }
  return instances[endpoint];
}
