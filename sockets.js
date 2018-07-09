const controllers = require('./controllers')

const sockets = {};
sockets.init = server => {

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', socket => {
      // client joins room ==> update other clients room list
      socket.on('JOIN', (room) => {
        socket.join(room)
        // emit to the clients we've got a new user
      });
      // Message sent from a client to be dispatched to the other clients
      // in that room
      socket.on('SEND_MESSAGE', data => new Promise(function(resolve, reject) {
        // update the db
        console.log(data)
        // when we fetch the message we populate the user field
        // below we are essentially de-populating it, i.e., setting user to
        // userId again
        data.user = data.user.userId;
        controllers.message.post(data)
        .then(res => {
        })
        .catch(err => console.log(err))
        // broadcast new message
        socket.broadcast.to(data.roomId).emit('RECEIVE_MESSAGE', data);
      }))
    });

}

module.exports = sockets;
