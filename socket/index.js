'use strict';
// const sha1 = require('sha1');

const server = require('http').createServer();
const channel = require('../lib/channel');
const storage = require('../lib/storage');


const config = require('../config/socket');

const Server = require('socket.io');
const io = Server(server, config);

const clients = new Map();
const event = config.event;
// io.origins([ 'http://10.12.130.110:8081', 'http://10.12.130.110:8080', 'http://139.159.210.220' ]);
io.origins((origin, callback) => {
  // if (origin !== 'https://foo.example.com') {
  //   return callback('origin not allowed', false);
  // }
  console.log('ws连接', origin)
  callback(null, true);
});
io.on('connection', socket => {
  let id;
  console.log('新设备接入', socket.id, '当前设备数量', clients.size);
  socket.on(event, obj => {
    console.log('模拟器发送命令', obj.cmd);
    switch (obj.cmd) {
      case 'regist':
        id = obj.id;
        clients.set(id, socket);
        console.log('注册设备', obj.id, socket.id);
        socket.emit(event, obj);
        break;
      case 'scanQRCode':
        console.log('接受到模拟器传来的扫一扫返回', obj);
        channel.emit(`scanQRCodeRes${obj.deviceid}&${obj.seqno}`, obj.data);
        break;
      default: break;
    }
  });

  socket.on('disconnect', reason => {
    // 注销设备
    if (id) {
      clients.delete(id);
      if (storage.user.get(id)) {
        storage.user.delete(id);
      }
    }
    console.log('当前设备数量', clients.size);
  });
});
server.listen(config.port);
console.log('启动socket服务', config);

channel.on('device', deviceid => {
  console.log('新控制器创建');
  clients.set(deviceid, 'nodevice');
});

channel.on('scanQRCode', ({ deviceid, seqno }) => {
  const socket = clients.get(deviceid)
  if (socket && socket !== 'nodedevice') {
    console.log('扫一扫', deviceid);
    socket.emit(event, {
      cmd: 'scanQRCode',
      seqno,
    });
  }
})

