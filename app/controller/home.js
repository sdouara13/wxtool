'use strict';

const sha1 = require('sha1');
const Controller = require('egg').Controller;

const token = 'lidaibin';
class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  async wxtoken() {
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
  async getwxtoken() {
    const { nonce, timestamp } = this.ctx.query;
    const array = [ nonce, timestamp, token ];
    array.sort();
    const str = array.join('');
    const sign = sha1(str);
    this.ctx.body = sign;
  }
}

module.exports = HomeController;
