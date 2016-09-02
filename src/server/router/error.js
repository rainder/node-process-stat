'use strict';

const Router = require('koa-router');
const ErrorModel = require('./../model/error');
const history = require('./../history');
const router = new Router();

module.exports = router.middleware();

router
  .get('/', function *() {
    this.body = yield ErrorModel.find();
  })
  .get('/:id', function *() {
    this.body = yield ErrorModel.findOne({
      _id: this.params.id
    });
  })
  .post('/_search', function *() {
    const query = this.request.body.query || {};
    const fields = this.request.body.fields || {};

    this.body = yield ErrorModel.find(query, fields);
  })
  .post('/_aggregate', function *() {
    this.body = yield ErrorModel.aggregate(this.request.body).exec();
  })
  .delete('/:id', function *() {
    this.body = yield ErrorModel.remove({
      _id: this.params.id
    });
  });
