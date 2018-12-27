const sockets = {};

sockets.init = function(server) {
  this.io = require('socket.io')(server, {wsEngine: 'ws'});
}

module.exports = sockets;