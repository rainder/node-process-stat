'use strict';

const _ = require('lodash');
const HistoryMinute = require('./model/history-minute');

module.exports = {
  track: (machineId, stats) => memory.machine(machineId).track(stats)
};

const absoluteMetrics = [
  'metric.process_usage.cpu',
  'metric.process_usage.memory',
  'metric.disk.free',
  'metric.memory.free'
];

const relativeMetrics = [];

/**
 *
 */
class Memory {
  /**
   *
   */
  constructor() {
    this._data = {};
  }

  /**
   *
   * @param id
   * @returns {*}
   */
  machine(id) {
    this._data[id] = this._data[id] || new Machine(id);
    return this._data[id];
  }
}

/**
 *
 */
class Machine {
  /**
   *
   * @param id
   */
  constructor(id) {
    this._id = id;
    this._cycles = 0;
    this._absolute = {};

    setInterval(this._store.bind(this), 60 * 1000);
  }

  /**
   *
   * @private
   */
  _store() {
    const calculated = {};

    for (let key of Object.keys(this._absolute)) {
      _.set(calculated, key, this._absolute[key] / this._cycles);
    }

    this._cycles = 0;
    this._absolute = {};

    HistoryMinute.create({
      machine_id: this._id,
      stats: calculated
    });
  }

  /**
   *
   * @param stats
   */
  track(stats) {
    this._cycles++;

    for (let key of absoluteMetrics) {
      const value = _.get(stats, key);
      this._absolute[key] = this._absolute[key] || 0;
      this._absolute[key] += value;
    }
  }
}

const memory = new Memory();