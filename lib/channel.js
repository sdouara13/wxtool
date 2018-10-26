'use strict';

class Event {
  constructor() {
    this.channels = new Map();
  }
  on(channelName, callback) {
    // 获取频道
    let channel = this.channels.get(channelName);
    if (!channel) {
      // 创建频道及其订阅队列
      this.channels.set(channelName, []);
      channel = this.channels.get(channelName);
    }
    // 加入订阅者
    channel.push(callback);
  }
  // off(channelName, callback) {
  //     let channel = this.channels.get(channelName)
  //     if(!channel) {
  //         return
  //     }
  //     channel[channelName]
  // }
  emit(channelName, value) {
    // 推送消息到订阅者
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.forEach(subscriber => {
        subscriber(value);
      });
    }
  }

  destroy(channelName, event) {
    // this.channels.clear()
    const channel = this.channels.get(channelName);
    // console.log('Delete channel', channelName, channel)

    if (!channel) {
      // console.log('Channel is unexist')
      return;
    }
    let i;
    for (i = 0; i < channel.length; i++) {
      // console.log('start delete channel', event, channel[i])

      if (channel[i] === event) {
        channel.splice(i, 1);
        // console.log('delete channel', event)
        break;
      }
    }
  }
}

module.exports = new Event();
