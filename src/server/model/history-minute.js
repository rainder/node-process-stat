'use strict';

const mongodb = require('./../mongodb');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  machine_id: {
    type: String,
    required: true
  },
  stats: Object,
  created: { type: Date, default: Date.now }
}, {
  minimize: false
});

schema.index({ machine_id: 1 });
schema.index({ created: 1 });

module.exports = mongodb.model('HistoryMinute', schema);