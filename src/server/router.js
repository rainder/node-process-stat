'use strict';

const compose = require('koa-compose');
const mount = require('koa-mount');
const jsonBody = require('koa-json-body');

module.exports = compose([
//  cors,
  jsonResponseWrapper,
  jsonBody({ limit: 1024 * 1024 }),
  mount('/log', require('./router/log')),
  mount('/history', require('./router/history')),
  mount('/config', require('./router/config')),
]);

function *jsonResponseWrapper(next) {
  try {
    yield next;

    if (this.body) {
      this.body = {
        success: true,
        data: this.body
      };
    }
  } catch (e) {
    this.body = {
      success: false,
      data: e
    };
  }
}


/**
 *
 * @param next
 */
function *cors(next) {
  this.set('Access-Control-Allow-Origin', this.get('origin'));
  this.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (this.method === 'OPTIONS') {
    this.body = 200;
    return;
  }

  yield next;
}
