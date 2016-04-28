'use strict';

const Router = require('koa-router');
const router = new Router();

module.exports = router.middleware();

router
  .get('/', function *() {
    this.body = {
      time: new Date()
    };
  });
