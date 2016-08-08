'use strict';

module.exports = class Counter {
  constructor() {
    this._data = {};
    this._data_per_sec = {};
    this._previous_data = {};

    this._interval = setInterval(this._calculateDataPerSec.bind(this), 1000).unref();
  }

  /**
   *
   * @private
   */
  _calculateDataPerSec() {
    for (let key of Object.keys(this._data)) {
      const previousValue = this._previous_data[key] || 0;
      this._previous_data[key] = this._data[key];
      this._data_per_sec[key] = this._data[key] - previousValue;
    }
  }

  /**
   *
   */
  destroy() {
    clearInterval(this._interval);
  }

  /**
   *
   * @param key {string}
   * @param amount {number}
   */
  inc(key, amount) {
    this._data[key] = (this._data[key] || 0) + amount;
  }

  /**
   *
   * @returns {{total: ({}|*), per_sec: ({}|*)}}
   */
  getStats() {
    return {
      total: this._data,
      per_sec: this._data_per_sec
    };
  }
}