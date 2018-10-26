'use strict';
// const sha1 = require('sha1');

const server = require('http').createServer();
const channel = require('../lib/channel');

const config = require('../config/socket');

const Server = require('socket.io');
const io = Server(server, config);

const clients = new Map();
const event = config.event;
io.origins([ 'http://10.12.130.110:8081', 'http://139.159.210.220' ]);
io.on('connection', socket => {
  let id;
  console.log('新设备接入', socket.id, '当前设备数量', clients.size);
  socket.on(event, obj => {
    if (obj.cmd === 'regist') {
      // console.log(obj, clients);
      if (clients.get(obj.id) === 'nodevice') {
        id = obj.id;
        clients.set(id, socket);
        console.log('注册设备', obj.id, socket.id);
        socket.emit(event, obj);
      } else {
        console.log('未注册设备进入连接');
      }
    }
  });

  socket.on('disconnect', reason => {
    // 注销设备
    if (id) {
      clients.delete(id);
    }
    console.log('当前设备数量', clients.size);
  });
});
server.listen(3000);
console.log('启动socket服务', config);

channel.on('device', deviceid => {
  console.log('新控制器创建');
  clients.set(deviceid, 'nodevice');
})

