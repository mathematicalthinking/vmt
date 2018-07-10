const controllers = require('./controllers')

const sockets = {};
sockets.init = server => {

    var io = require('socket.io').listen(server);
    io.sockets.on('connection', socket => {
      // client joins room ==> update other clients room list
      socket.on('JOIN', data => {
        console.log('joining room: ', data.room)
        socket.join(data.room.id, () => {
          socket.broadcast.to(data.room.id).emit('NEW_USER', data.user)
        })
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
        const username = data.user.username;
        const userId = data.user.userId
        data.user = data.user.userId;
        console.log(io.sockets)
        console.log(Object.keys(io.sockets.sockets))
        controllers.message.post(data)
        .then(res => {
          // and then re-populate ==> theres probably a better way to do this
          data.user = {username, userId,}
          socket.broadcast.to(data.room).emit('RECEIVE_MESSAGE', data);
        })
        .catch(err => console.log(err))
        // broadcast new message
      }))

      socket.on('SEND_EVENT', data => new Promise((resolve, reject) => {
        console.log("RECEIVED DATA");
        console.log("ggbdata: ", data.roomId)

        // console.log(io.sockets.clients(data.roomId))
        socket.broadcast.to(data.roomId).emit('RECEIVE_EVENT', data.event)
      }))
    });

}

module.exports = sockets;
