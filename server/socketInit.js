const sockets = {};
const options = {
  serveClient: !(
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
  ),
  // path: '/socket.io',
  pingTimeout: 5000,
  pingInterval: 25000,
  // This defines how many bytes a single message can be, before closing the socket.
  maxHttpBufferSize: 1e8,
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:8080',
    ],
    methods: ['GET', 'POST'],
    // allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
};

sockets.init = function(server) {
  this.io = require('socket.io')(server, options);
};

module.exports = sockets;
