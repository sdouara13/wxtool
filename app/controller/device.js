'use strict';

const sha1 = require('sha1');
const Controller = require('egg').Controller;
const channel = require('../../lib/channel');
const storage = require('../../lib/storage');

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
    const { deviceid, seqno } = this.ctx.query;
    // const self = this;
    channel.emit('scanQRCode', { deviceid, seqno });
    let scanEvent;
    const scanResult = await new Promise(resove => {
      channel.on(`scanQRCodeRes${deviceid}&${seqno}`, scanEvent = res => {
        console.log('扫一扫返回', res);
        resove(res);
        channel.destroy(`scanQRCodeRes${deviceid}&${seqno}`, scanEvent);
      }, 30 * 1000);
    });
    this.ctx.body = scanResult;
  }
  async getUserInfo() {
    const { deviceid } = this.ctx.query;
    const userInfo = storage.user.get(deviceid);
    if (userInfo) {
      this.ctx.body = userInfo;
    } else {
      this.ctx.body = null;
    }
  }
}

module.exports = DeviceController;
