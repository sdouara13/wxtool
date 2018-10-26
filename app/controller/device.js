'use strict';

const sha1 = require('sha1');
const Controller = require('egg').Controller;
const channel = require('../../lib/channel');

const token = 'device';
let id = 0;
class DeviceController extends Controller {
  async getDeviceId() {
    const deviceid = sha1(id, token);
    this.ctx.body = deviceid;
    channel.emit('device', deviceid);
    id++;
  }
  async scanQRCode() {
    const { deviceid } = this.ctx.query;
    channel.emit('scanQRCode', deviceid);
  }
}

module.exports = DeviceController;
