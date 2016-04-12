'use strict';

const _ = require('lodash');
const config = require('config');
const mongoose = require('mongoose');
const connection = mongoose.createConnection();

connection.on('error', error);
connection.on('connected', connected);
connection.on('disconnected', disconnected);
connection.on('reconnect', reconnect);

const COMMON_OPTIONS = {
  server: {
    poolSize: 1,
    auto_reconnect: true,
  },

  db: {
    native_parser: true,
    retryMiliSeconds: 5000,
  },

  socketOptions: {
    connectTimeoutMS: 1000,
    keepAlive: 3600000,
    socketTimeoutMS: 1000,
  }
}

const CONFIG = {
  URL: config.get('mongodb.url'),
  OPTIONS: _.merge({}, COMMON_OPTIONS, config.get('mongodb.options'))
};

connect();

module.exports = connection;

/**
 *
 */
function connect() {
  if (~CONFIG.URL.indexOf(',')) {
    connection.openSet(CONFIG.URL, CONFIG.OPTIONS);
  } else {
    connection.open(CONFIG.URL, CONFIG.OPTIONS);
  }
}

/**
 *
 * @param err
 */
function error(err) {
  console.error('MongoDB Connection error:', err.message);

  if (err) {
    connection.db.close();
  }
}

/**
 *
 */
function connected() {
  console.log('MongoDB connected');
}

/**
 *
 */
function disconnected() {
  console.log('MongoDB disconnected');
  setTimeout(connect, 1000);
}

/**
 *
 */
function reconnect() {
  console.log('MongoDB reconnect');
}