# memcache-middleware

## Uso

```javascript
const express = require('express');
const memcacheMiddlewareConstructor = require('./');

const memcacheMiddleware = memcacheMiddlewareConstructor('localhost:11211')

const app = express();
app.use(memcacheMiddleware);

app.get('/', function (req, res) {
  res.locals.CACHE = {
    duration: 3600 // la duracion va en segundos
  };
  res.send('esto sera cacheado');
});

app.get('/otro', function (req, res) {
  res.locals.CACHE = {
    key: 'guardarconestakey',
    duration: 3600 // la duracion va en segundos
  };
  res.send('esto sera cacheado en guardarconestakey');
});

app.listen('9100');
```
