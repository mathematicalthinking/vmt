const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const { getMtSsoUrl, getEncUrl } = require('./config/app-urls');

const allowedOrigins = [getMtSsoUrl(), getEncUrl()];

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  allowedOrigins.push('http://localhost:3000');
}

const sockets = {};
const options = {
  serveClient: !(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
  ),
  // path: '/socket.io',
  pingTimeout: 7000,
  pingInterval: 23000,
  // This defines how many bytes a single message can be, before closing the socket.
  maxHttpBufferSize: 1e8,
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    // allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
};

sockets.init = function(server) {
  this.io = new Server(server, options);
  const pubClient = createClient({ url: 'redis://127.0.0.1:6379' });
  const subClient = pubClient.duplicate();

  this.io.adapter(createAdapter(pubClient, subClient));
};

module.exports = sockets;
