'use strict';

module.exports = {
  port: 3843,
  path: '/websocket',
  serveClient: true,
  origins: '*',
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  event: 'BRIDGE',
  token: 'socketio',
}
