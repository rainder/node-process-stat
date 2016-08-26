'use strict';

const _ = require('lodash');
const co = require('co');
const dgram = require('dgram');
const request = require('co-request');
const tryCatch = require('co-try-catch');
const Counter = require('./client/counter');
const Metric = require('./client/metric');

const Message = require('./dgram/transport-layer/message')
const client = dgram.createSocket('udp4');

module.exports = class Client {
  /**
   *
   * @param options
   */
  constructor(id, options) {
    this._id = id;
    this._options = _.defaults(options, {
      push_interval: 1000
    });

    this._counter = new Counter();
    this._metric = new Metric();
    this._metadata = {};
    this._close = false;

    this._init();
  }

  _init() {
    co(this._initStatsPusher()).catch(err => console.error(err.stack || err));
  }

  /**
   *
   * @private
   */
  *_initStatsPusher() {
    yield cb => setTimeout(cb, 1000).unref();

    while (true) {
      if (this._close) {
        break;
      }

      yield cb => setTimeout(cb, this._options.push_interval).unref();

      const message = Message.createFromObject({
        method: 'log',
        data: {
          id: this._id,
          metadata: this._metadata,
          stats: this.getStats(),
          date: new Date()
        }
      });

      const response = yield tryCatch(message.send(client, this._options.port, this._options.host));

      if (response.err) {
        console.error('err', response.err);
        continue;
      }
    }
  }

  /**
   *
   */
  destroy() {
    this._counter.destroy();
  }

  /**
   *
   * @param key {string}
   * @param amount {number}
   * @returns {Client}
   */
  inc(key, amount) {
    this._counter.inc(key, amount || 1);
    return this;
  }

  /**
   *
   * @param key {string}
   * @param amount {number}
   * @returns {Client}
   */
  dec(key, amount) {
    this._counter.inc(key, amount || -1);
    return this;
  }

  /**
   *
   * @param key
   * @param value
   * @returns {Client}
   */
  set(key, value) {
    this._metric.set(key, value);
    return this;
  }

  /**
   *
   * @param key
   * @param value
   * @returns {Client}
   */
  setMeta(key, value) {
    this._metadata[key] = value;
    return this;
  }

  /**
   *
   * @returns {{counter: {total: *, per_sec: *}}}
   */
  getStats() {
    return {
      counter: this._counter.getStats(),
      metric: this._metric.getStats()
    };
  }

  close() {
    this._close = true;
  }
};
