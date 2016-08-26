'use strict';

const co = require('co');
const dgram = require('dgram');
const config = require('config');

const server = dgram.createSocket('udp4');
const Stack = require('./transport-layer/stack');
const Packet = require('./transport-layer/packet');
const Message = require('./transport-layer/message');

const stack = new Stack();
const router = {
  'log': require('./router/log')
};

const CONFIG = {
  HOST: config.get('server.udp.host'),
  PORT: config.get('server.udp.port')
};

module.exports = {
  server,
  start
};

server.on('error', (err) => {
  console.error(`UDP Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  const packet = Packet.fromBuffer(msg);
  stack.processPacket(packet, rinfo);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`UDP Server is listening on ${address.address}:${address.port}`);
});

stack.onMessage = (data) => {
  if (!router[data.body.method]) {
    return console.error(`unknown route specified ${data.body.method}`);
  }

  co(router[data.body.method](data.body.data)).catch(e => console.error(e));
}

/**
 * 
 */
function *start() {
  yield cb => server.bind(CONFIG.PORT, CONFIG.HOST, cb);
}
