'use strict';

const sha1 = require('sha1');
const request = require('request-promise');
const Controller = require('egg').Controller;

const token = 'lidaibin';
const config = require('../../config/wx');
class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  async WXtoken() {
    console.log('验证token');
    const query = this.ctx.query;
    console.log('参数', query);
    const { signature, nonce, timestamp, echostr } = query;
    const array = [ nonce, timestamp, token ];
    array.sort();
    const str = array.join('');
    const sign = sha1(str);
    console.log('对比签名', sign, signature);
    if (sign === signature) {
      this.ctx.body = echostr;
    } else {
      this.ctx.body = null;
    }
  }
  async getWXtoken() {
    const { nonce, timestamp } = this.ctx.query;
    const options = {
      uri: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type: 'client_credential',
        appid: config.appid,
        secret: config.secret,
      },
      headers: {
        'User-Agent': 'Request-Promise',
      },
      json: true,
    };
    request(options)
      .then(res => {
        console.log('申请accesstoken结果', res);
      })
      .catch(err => {
        console.log('申请accesstoken失败', err);
      })
    // request.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.secret}`);
    const array = [ nonce, timestamp, token ];
    array.sort();
    const str = array.join('');
    const sign = sha1(str);
    this.ctx.body = sign;
  }
}

module.exports = HomeController;
