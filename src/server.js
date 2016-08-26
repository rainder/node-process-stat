'use strict';

const co = require('co');
const koa = require('koa');
const config = require('config');
const http = require('http');
const router = require('./server/router');
const dgramServer = require('./dgram/server');

const CONFIG = {
  HOST: config.get('server.http.host'),
  PORT: config.get('server.http.port')
};

module.exports = {
  launch: () => co(launch)
};

function *launch() {
  const app = koa();
  const server = http.createServer(app.callback());

  app.use(router);

  yield cb => server.listen(CONFIG.PORT, CONFIG.HOST, cb);
  
  yield dgramServer.start();

  console.log(`HTTP Server is listening on ${CONFIG.HOST}:${CONFIG.PORT}`);

  yield waitForSignal();

  console.log('Got SIGINT');
}

/**
 *
 * @returns {Promise}
 */
function waitForSignal() {
  return new Promise(resolve => {
    process.on('SIGINT', resolve);
  });
}
