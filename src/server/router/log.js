'use strict';

const Router = require('koa-router');
const Current = require('./../model/current');
const V = require('./../request-validation');
const history = require('./../history');
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
      _id: this.params.id
    });
  })
  .post('/_search', function *() {
    const query = this.request.body.query || {};
    const fields = this.request.body.fields || {};

    this.body = yield Current.find(query, fields);
  })
  .post('/_aggregate', function *() {
    this.body = yield Current.aggregate(this.request.body).exec();
  })
  .delete('/:id', function *() {
    this.body = yield Current.remove({
      _id: this.params.id
    });
  })
  .post('/', function *() {
    const body = validate(this.request.body);

    history.track(body.id, body.stats);

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
