const express = require('express');
const memcacheMiddlewareConstructor = require('./');

const memcacheMiddleware = memcacheMiddlewareConstructor('localhost:11211')

const app = express();
app.use(memcacheMiddleware);

app.get('/', function (req, res) {
  res.locals.CACHE = {
    duration: 3600, // la duracion va en segundos
    URL: 'localhost',
  };
  res.write('esto sera cacheado' + (+new Date()));
  res.end();
});
app.get('/no', function (req, res) {
  res.locals.CACHE = {
    duration: 0, // la duracion va en segundos
    URL: 'localhostno',
  };
  res.write('esto no sera cacheado' + (+new Date()));
  res.end();
});

app.get('/gethead', function (req, res) {
  res.locals.CACHE = {
    duration: 0, // la duracion va en segundos
    URL: 'localhostno2',
  };
  res.write('GET,HEAD');
  res.end();
});

app.get('/json', function (req, res) {
  res.locals.CACHE = {
    duration: 3600 // la duracion va en segundos
  };
  res.json('esto sera cacheado');
});

app.get('/json1', function (req, res) {
  res.locals.CACHE = {
    duration: 3600 // la duracion va en segundos
  };
  res.json('esto sera cacheado').end();
});

app.get('/json2', function (req, res) {
  res.locals.CACHE = {
    duration: 3600 // la duracion va en segundos
  };
  res.end(JSON.stringify('esto sera cacheado'));
});


app.get('/otro', function (req, res) {
  res.locals.CACHE = {
    duration: 3600 // la duracion va en segundos
  };
  res.send('esto sera cacheado en guardarconestakey').end();
});

app.listen('9100');
