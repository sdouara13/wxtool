'use strict';

const sha1 = require('sha1');
const request = require('request-promise');
const Controller = require('egg').Controller;

const token = 'lidaibin';
const config = require('../../config/wx');
const access_token = {
  value: null,
  expire: null,
  timeout: 7200 * 1000,
};
const jsapi_ticket = {
  value: null,
  expire: null,
  timeout: 7200 * 1000,
};
class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
    // await this.ctx.render('index.html');
  }
  async render() {
    await this.ctx.render('MP_verify_LKjzWT0wexOEhYuS.txt');
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
    const { nonceStr, timestamp, deviceid } = this.ctx.query;
    if (access_token.value === null || (Date.now() - access_token.expire) > access_token.timeout ||
      jsapi_ticket.value === null || (Date.now() - jsapi_ticket.expire) > jsapi_ticket.timeout) {
      /**
       * TODO: 使用app.curl重写这块内容，当时没来得及看egg文档
       * */
      // const self = this;
      // const options = {
      //   uri: 'https://api.weixin.qq.com/cgi-bin/token',
      //   qs: {
      //     grant_type: 'client_credential',
      //     appid: config.appid,
      //     secret: config.secret,
      //   },
      //   headers: {
      //     'User-Agent': 'Request-Promise',
      //   },
      //   json: true,
      // };
      // request(options)
      //   .then(res => {
      //     console.log('申请accesstoken结果', res);
      //     if (res.access_token) {
      //       access_token.value = res.access_token;
      //       access_token.expire = Date.now();
      //       /**
      //        * 获取jsapi_ticket
      //        * */
      //       const ticketOption = {
      //         uri: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
      //         qs: {
      //           access_token: access_token.value,
      //           type: 'jsapi',
      //         },
      //         headers: {
      //           'User-Agent': 'Request-Promise',
      //         },
      //         json: true,
      //       };
      //       return request(ticketOption);
      //     }
      //     access_token.value = null;
      //     access_token.expire = null;
      //     return new Promise((resolve, reject) => {
      //       reject('结果中无access_token');
      //     });
      //   })
      //   .then(res => {
      //     if (res.ticket) {
      //       console.log('更新ticket', res);
      //       jsapi_ticket.value = res.ticket;
      //       jsapi_ticket.expire = Date.now();
      //       const url = `http://www.wxapidev.cn/wxsimulator/?deviceid=${deviceid}`;
      //       const str = `jsapi_ticket=${jsapi_ticket.value}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
      //       const sign = sha1(str);
      //       self.ctx.body = sign;
      //     } else {
      //       return new Promise((resolve, reject) => {
      //         reject('结果中无jsapi_ticket');
      //       });
      //     }
      //   })
      //   .catch(err => {
      //     console.log('失败', err);
      //     self.ctx.body = {
      //       err,
      //     };
      //   });


      const result = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/token', {
        method: 'GET',
        dataType: 'json',
        data: {
          grant_type: 'client_credential',
          appid: config.appid,
          secret: config.secret,
        },
      });
      console.log('申请accesstoken结果', result.data);

      if (result.data.access_token) {
        access_token.value = result.data.access_token;
        access_token.expire = Date.now();
        const ticketRes = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
          method: 'GET',
          dataType: 'json',
          data: {
            access_token: access_token.value,
            type: 'jsapi',
          },
        });
        console.log('更新ticket', ticketRes.data.ticket);

        if (ticketRes.data.ticket) {
          jsapi_ticket.value = ticketRes.data.ticket;
          jsapi_ticket.expire = Date.now();
          const url = `http://www.wxapidev.cn/wxsimulator/?deviceid=${deviceid}`;
          const str = `jsapi_ticket=${jsapi_ticket.value}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
          const sign = sha1(str);
          this.ctx.body = sign;
        } else {
          this.ctx.body = 'no signature';
        }
      } else {
        access_token.value = null;
        access_token.expire = null;
        this.ctx.body = 'no signature';
      }
    } else {
      /**
       * 直接使用现有ticket
       * */
      const url = `http://www.wxapidev.cn/wxsimulator/?deviceid=${deviceid}`;
      const str = `jsapi_ticket=${jsapi_ticket.value}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
      const sign = sha1(str);
      console.log(str, sign);
      this.ctx.body = sign;
    }
  }
}

module.exports = HomeController;
