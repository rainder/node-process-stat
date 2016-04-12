#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const skerlaConsole = require('skerla-console');
const server = require('./../src/server');

_.extend(global.console, skerlaConsole());

server.launch()
  .then(() => {
    console.log('Exiting...');
    process.exit(0);
  })
  .catch(err => console.error(err.stack || err));