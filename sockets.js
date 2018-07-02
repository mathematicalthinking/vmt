var sockets = {};

sockets.init = server => {

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', socket => {
      console.log('socket connected');
      socket.on('SEND_MESSAGE', data => new Promise(function(resolve, reject) {
        console.log("DATA: ",data)
        socket.broadcast.to(data.room).emit('RECEIVE_MESSAGE', data);
      }))
    });

}

module.exports = sockets;
