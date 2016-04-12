'use strict';

const Router = require('koa-router');
const Current = require('./../model/current');
const V = require('./../request-validation');
const router = new Router();

const validate = V.schema({
  id: V(String).required(),
  stats: V(Object).required(),
  metadata: V(Object).required(),
  date: V(String).required()
})

module.exports = router.middleware();

router
  .get('/', function *() {
    this.body = yield Current.find();
  })
  .get('/:id', function *() {
    this.body = yield Current.findOne({
      machine_id: this.params.id
    });
  })
  .delete('/:id', function *() {
    this.body = yield Current.remove({
      machine_id: this.params.id
    });
  })
  .post('/', function *() {
    const body = validate(this.request.body);

    const current = yield Current.findOneAndUpdate({
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

    this.body = current;
  });
