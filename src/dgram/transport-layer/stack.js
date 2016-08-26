'use strict';

const Message = require('./message');

class Stack {
  constructor() {
    this.stack = new Map();
  }

  processPacket(packet, rinfo) {
    if (!this.stack.has(packet.id)) {
      const message = new Message(packet.id);

      this.stack.set(packet.id, message);

      message.onFin = (json) => {
        this.stack.delete(packet.id);
        this.onMessage({
          id: packet.id,
          info: {
            address: rinfo.address,
            family: rinfo.family,
            port: rinfo.port
          },
          body: json
        });
      };

      message.onTimeout = () => {
        this.stack.delete(packet.id);
      };
    }

    this.stack.get(packet.id).addPacket(packet);
  }

  onMessage() {
    throw new Error('not implemented');
  }
}

module.exports = Stack;
