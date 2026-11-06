const EventEmitter = require('node:events');
const os = require('node:os');

class Logger extends EventEmitter {
  constructor() {
    super();
    this.on('log', (message) => {
      const time = new Date(Date.now()).toLocaleTimeString();
      const platform = os.platform();
      console.log(`[${time}] [${platform}] ${message}`);
    });
  }
}

module.exports = new Logger();