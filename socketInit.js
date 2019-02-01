const sockets = {};

sockets.init = function(server) {
  this.io = require("socket.io").listen(server, {
    serveClient:
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "staging"
        ? false
        : true,
    path: "/socket.io"
  });
};

module.exports = sockets;
