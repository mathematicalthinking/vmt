const controllers = require('./controllers')

const sockets = {};
sockets.init = server => {

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', socket => {
      console.log('socket connected');
      // client joins room ==> update other clients room list
      socket.on('JOIN', (room) => {
        socket.join(room)
        // emit to the clients we've got a new user
      });
      // Message sent from a client to be dispatched to the other clients
      // in that room
      socket.on('SEND_MESSAGE', data => new Promise(function(resolve, reject) {
        console.log("DATA: ",data)
        // update the db
        controllers.message.post(data)
        .then(res => {
          console.log("socket: ", res)
        })
        .catch(err => console.log(err))
        // broadcast new message
        socket.broadcast.to(data.room).emit('RECEIVE_MESSAGE', data);
      }))
    });

}

module.exports = sockets;
