'use strict';

require('co-mocha');
const chai = require('chai');
const Client = require('../');
const koa = require('koa');
const jsonBody = require('koa-json-body');
chai.should();

describe('all-test', function () {
  let client;
  const app = koa();
  const stack = [];

  app.use(jsonBody({ limit: 1024 * 1024 }));
  app.use(function *() {
    stack.push({
      url: this.url,
      method: this.method,
      body: this.request.body
    });
  });

  app.listen('23897');

  this.timeout(60000);

  it('should create an instance', function *() {
    client = new Client('test-id', {
      url: 'http://127.0.0.1:23897',
      metadata: {
        name: 1
      }
    });
    client.should.be.instanceOf(Client);
  });

  it('should calculate items per sec', function *() {
    client.inc('test', 1);
    client.inc('test', 2);
    yield cb => setTimeout(cb, 1200);
    client.inc('test', 1);

    client.getStats().counter.total.test.should.equals(4);
    client.getStats().counter.per_sec.test.should.equals(3);
  });

  it('should set metric', function *() {
    client.set('disk', {
      free: 20,
      total: 50
    });

    client.getStats().should.deep.equals({
      counter: {
        total: { test: 4 },
        per_sec: { test: 3 }
      },
      metric: {
        disk: {
          free: 20,
          total: 50
        }
      }
    })
  });

  it('should receive a push', function *() {
    yield cb => setTimeout(cb, 1000);

    stack.length.should.equals(1);
    const item = stack.shift();
    item.method.should.equals('POST');
    item.url.should.equals('/log');
    item.body.should.have.keys(['id', 'metadata', 'stats', 'date']);
  });

});
