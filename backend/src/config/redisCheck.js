const net = require('net');
const config = require('./index');

/**
 * Checks if the Redis port is active on the configured host and port.
 * @returns {Promise<boolean>}
 */
const checkRedisPort = () => {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(1500); // 1.5 second timeout

    client.on('connect', () => {
      client.destroy();
      resolve(true);
    });

    client.on('timeout', () => {
      client.destroy();
      resolve(false);
    });

    client.on('error', () => {
      client.destroy();
      resolve(false);
    });

    client.connect(config.redis.port, config.redis.host);
  });
};

module.exports = checkRedisPort;
