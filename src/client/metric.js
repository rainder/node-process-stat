'use strict';

module.exports = class Metric {
  constructor() {
    this._data = {};
  }

  /**
   *
   * @param key
   * @param value
   * @returns {Metric}
   */
  set(key, value) {
    this._data[key] = value;
    return this;
  }

  /**
   *
   * @returns {{}|*}
   */
  getStats() {
    return this._data;
  }
};