'use strict';

const Router = require('koa-router');
const Current = require('./../model/current');
const V = require('./../request-validation');
const HistoryMinutes = require('./../model/history-minute');
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
    this.body = yield HistoryMinutes.find({
      $gt: new Date(Date.now() - 1000 * 60 * 60)
    });
  })
  .post('/_search', function *() {
    const defaultSearch = {
      created: { $gt: new Date(Date.now() - 1000 * 60 * 60) }
    };
    
    this.body = yield HistoryMinutes.find(this.request.body || defaultSearch);
  });
