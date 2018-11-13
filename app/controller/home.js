'use strict';

const sha1 = require('sha1');
const Controller = require('egg').Controller;

const token = 'lidaibin';
const config = require('../../config/wx');
const storage = require('../../lib/storage');
const access_token = {
  value: null,
  expire: null,
  timeout: 7200 * 1000,
};
const user_token = new Map();

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
    const { nonceStr, timestamp, url } = this.ctx.query;
    if (access_token.value === null || (Date.now() - access_token.expire) > access_token.timeout ||
      jsapi_ticket.value === null || (Date.now() - jsapi_ticket.expire) > jsapi_ticket.timeout) {
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
      const str = `jsapi_ticket=${jsapi_ticket.value}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
      const sign = sha1(str);
      console.log(str, sign);
      this.ctx.body = sign;
    }
  }
  async getUserAuth() {
    const { code, grant_type, deviceid } = this.ctx.query;
    // TODO: 用户信息获取有问题，每个code对应每个用户
    const userToken = await this.ctx.curl('https://api.weixin.qq.com/sns/oauth2/access_token', {
      method: 'GET',
      dataType: 'json',
      data: {
        appid: config.appid,
        secret: config.secret,
        code,
        grant_type,
      },
    });
    console.log('获取用户token1', userToken.data);
    if (userToken.data.access_token) {
      user_token.set(userToken.data.access_token, {
        openid: userToken.data.openid,
        expire: Date.now(),
        timeout: 7200 * 1000,
        refresh_timeout: 3600 * 24 * 30 * 1000,
        refresh_token: userToken.data.refresh_token,
      });
    } else {
      this.ctx.body = '获取用户token失败';
      return;
    }
    // if (user_token.value === null || (Date.now() - user_token.expire) > user_token.timeout) {
    // Abandoned： 目前不需要刷新用户token
    // // 若用户token失效，则刷新用户token
    // const userToken = await this.ctx.curl('https://api.weixin.qq.com/sns/oauth2/refresh_token', {
    //   method: 'GET',
    //   dataType: 'json',
    //   data: {
    //     appid: config.appid,
    //     refresh_token: user_refresh_token.value,
    //     grant_type: 'refresh_token',
    //   },
    // });
    // console.log('获取用户token2', userToken.data);
    // if (userToken.data.access_token) {
    //   user_token.value = userToken.data.access_token;
    //   user_token.attr.openid = userToken.data.openid;
    //   user_token.expire = Date.now();
    // } else {
    //   this.ctx.body = '获取用户token失败';
    //   return;
    // }
    // }
    const userInfo = await this.ctx.curl('https://api.weixin.qq.com/sns/userinfo', {
      method: 'GET',
      dataType: 'json',
      data: {
        access_token: userToken.data.access_token,
        openid: userToken.data.openid,
        lang: 'zh_CN',
      },
    });
    console.log('获取用户信息', userInfo.data);
    storage.user.set(deviceid, userInfo.data);
    if (userInfo.data) {
      this.ctx.body = userInfo.data;
    } else {
      this.ctx.body = '获取用户信息失败';
    }
  }
}

module.exports = HomeController;
