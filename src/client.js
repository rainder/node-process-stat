'use strict';

const _ = require('lodash');
const co = require('co');
const request = require('co-request');
const tryCatch = require('co-try-catch');
const Counter = require('./client/counter');
const Metric = require('./client/metric');

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
    this._metadata = options.metadata || {};

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
    const url = this._options.url;

    if (!url) {
      return;
    }

    yield cb => setTimeout(cb, 1000);

    while (true) {
      yield cb => setTimeout(cb, this._options.push_interval);
      const response = yield tryCatch(request({
        method: 'POST',
        url: `${url}/log`,
        json: true,
        body: {
          id: this._id,
          metadata: this._metadata,
          stats: this.getStats(),
          date: new Date()
        }
      }));

      if (response.err) {
        console.error('err', response.err);
        continue;
      }

      if (!response.result.body.success) {
        console.log(response.result.statusCode, JSON.stringify(response.result.body.data, 0, 2));
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
};