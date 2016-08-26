'use strict';

const objectid = require('objectid');
const Packet = require('./packet');

const PACKET_SIZE = 1024;

class Message {
  constructor(id) {
    this.id = id;
    this.packets = 0;
    this.size = 0;
    this.chunks = [];
  }

  /**
   * 
   * @param buffer
   * @returns {Message}
   */
  static createFromBuffer(buffer) {
    const message = new Message(objectid().toString());
    message.size = Math.ceil(buffer.length / PACKET_SIZE);
    message.packets = message.size;

    for (let i = 0; i < message.size; i++) {
      message.chunks.push(buffer.slice(i * PACKET_SIZE, i * PACKET_SIZE + PACKET_SIZE));
    }

    return message;
  }
  
  static createFromObject(object) {
    const buffer = new Buffer(JSON.stringify(object));
    return Message.createFromBuffer(buffer);
  }

  /**
   *
   * @param index
   * @returns {Buffer|NodeBuffer}
   */
  getPacket(index) {
    return new Packet(
      this.id,
      index,
      index === this.size - 1,
      this.chunks[index]
    );
  }

  /**
   *
   * @param packet {Packet}
   */
  addPacket(packet) {
    if (!this.timer) {
      this.timer = setTimeout(() => this.onTimeout(), 30000).unref();
    }

    this.packets++;
    if (packet.is_last) {
      this.size = packet.seq + 1;
    }
    this.chunks[packet.seq] = packet.chunk;

    if (this.packets === this.size) {
      const json = JSON.parse(Buffer.concat(this.chunks).toString());
      clearTimeout(this.timer);
      this.onFin(json);
    }
  }

  onFin() {
    throw new Error('not implemented');
  }

  onTimeout() {
    throw new Error('not implemented');
  }

  *send(client, port, host) {
    for (let i = 0; i < this.size; i++) {
      const packet = this.getPacket(i);
      yield cb => client.send(packet.toBuffer(), port, host, cb);
    } 
  }
}

module.exports = Message;
