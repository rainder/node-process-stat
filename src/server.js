'use strict';

const co = require('co');
const koa = require('koa');
const config = require('config');
const http = require('http');
const router = require('./server/router');

const CONFIG = {
  HOST: config.get('server.host'),
  PORT: config.get('server.port')
};

module.exports = {
  launch: () => co(launch)
};

function *launch() {
  const app = koa();
  const server = http.createServer(app.callback());

  app.use(router);

  yield cb => server.listen(CONFIG.PORT, CONFIG.HOST, cb);

  console.log(`Server is listening on ${CONFIG.HOST}:${CONFIG.PORT}`);

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