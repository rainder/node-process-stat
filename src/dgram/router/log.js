'use strict';

const Current = require('./../../server/model/current');

module.exports = function *(body) {
  yield Current.update({
    machine_id: body.id
  }, {
    $currentDate: { updated: true },
    $set: {
      stats: body.stats,
      metadata: body.metadata,
      date: body.date
    },
    $setOnInsert: {
      created: new Date()
    }
  }, {
    upsert: true,
    new: true
  });
}
