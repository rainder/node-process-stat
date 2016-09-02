'use strict';

const mongodb = require('./../mongodb');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  hash: {
    type: String,
    required: true
  },

  stack: String,
  info: Object,

  sources: [String],

  stats: {
    occurrence_count: Number
  },

  created: { type: Date, default: Date.now },
  updated: { type: Date }
}, {
  minimize: false
});

schema.index({ hash: 1 });

module.exports = mongodb.model('Error', schema);
