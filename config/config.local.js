'use strict';
const path = require("path");
module.exports = appInfo => {
  const config = exports = {
    logger: {
      dir: path.join(appInfo.baseDir, 'logs'),
    },
    cluster: {
      listen: {
        path: '',
        port: 7001,
        hostname: '0.0.0.0',
      }
    }
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1540366049232_4267';

  // add your config here
  config.middleware = [];

  return config;
};
