'use strict';

const compose = require('koa-compose');
const mount = require('koa-mount');
const jsonBody = require('koa-json-body');

module.exports = compose([
  jsonResponseWrapper,
  jsonBody({ limit: 1024 * 1024 }),
  mount('/log', require('./router/log'))
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