'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/wxtoken', controller.home.WXtoken);
  router.get('/getwxtoken', controller.home.getWXtoken);
  router.get('/getuserauth', controller.home.getUserAuth);
  router.get('/getdeviceid', controller.device.getDeviceId);
  router.get('/scanqrcode', controller.device.scanQRCode);
  router.get('/getuserinfo', controller.device.getUserInfo);
};
