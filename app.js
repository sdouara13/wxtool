'use strict';

require('./socket');

module.exports = app => {
  app.beforeStart(async () => {
    // console.log('启动socket服务');

    // 也可以通过以下方式来调用 Service
    // const ctx = app.createAnonymousContext();
    // app.cities = await ctx.service.cities.load();
  });
};
