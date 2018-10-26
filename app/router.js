'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/wxtoken', controller.home.WXtoken);
  router.get('/getwxtoken', controller.home.getWXtoken);
  router.get('/getdeviceid', controller.device.getDeviceId);
};
