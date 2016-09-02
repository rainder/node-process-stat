'use strict';

const crypto = require('crypto');

const ErrorModel = require('./../../server/model/error');

module.exports = function *(body) {
  console.assert(typeof body.stack === 'string');
  console.assert(typeof body.info === 'object');
  console.assert(typeof body.source === 'string');

  const hash = crypto.createHash('md5').update(body.stack).digest('hex');

  yield ErrorModel.update({
    hash
  }, {
    $currentDate: {
      'updated': true
    },
    $inc: {
      'stats.occurrence_count': 1
    },
    $addToSet: {
      'sources': body.source
    },
    $set: {
      'info': body.info,
    },
    $setOnInsert: {
      'created': new Date(),
      'stack': body.stack
    }
  }, {
    upsert: true,
    new: true
  });
}
