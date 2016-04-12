'use strict';

const mongodb = require('./../mongodb');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  machine_id: {
    type: String,
    required: true
  },
  stats: Object,
  metadata: Object,
  created: { type: Date, default: Date.now },
  updated: { type: Date }
}, {
  minimize: false
});

schema.index({ machine_id: 1 });

module.exports = mongodb.model('Current', schema);