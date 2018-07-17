const controllers = require('./controllers')

const sockets = {};
sockets.init = server => {

    var io = require('socket.io')(server, {wsEngine: 'ws'}); // AHHHH FUCK YOU WINDOWS
    // without this wsEngine setting the socket events would be delayed upwards of 20 seconds
    io.sockets.on('connection', socket => {
      // client joins room ==> update other clients room list
      socket.on('JOIN', (data, callback) => {
        socket.join(data.roomId, () => {
          // update current users of this room
          controllers.room.addCurrentUsers(data.roomId, data.user._id)
          .then(room => {
            // executes the callback on the clientside to confirm join
            callback('success'); // @TODO eventually do error handling with this
            return socket.broadcast.to(data.roomId).emit('NEW_USER', room.currentUsers)
          })
          .catch(err => console.log(err))
          // emit to other clients
          console.log('new user joind emit other clients')
        })
        // emit to the clients we've got a new user
      });
      // Message sent from a client to be dispatched to the other clients
      // in that room
      socket.on('LEAVE_ROOM', data => {
        console.log('DISCONNECTING FROM SOCKETS')
        socket.leave(data.roomId, () => {
          controllers.room.removeCurrentUsers(data.roomId, data.userId)
          .then(room => {
            console.log("room after disconnect: ",room);
            return socket.broadcast.to(data.roomId).emit('USER_LEFT', room.currentUsers);
          })
          .catch(err => console.log(err))
        })
      })
      socket.on('SEND_MESSAGE', data => {
        // when we fetch the message we populate the user field
        // below we are essentially de-populating it, i.e., setting user to
        // userId again
        const username = data.user.username;
        const userId = data.user.userId
        data.user = data.user.userId;
        controllers.message.post(data)
        .then(res => {
          // and then re-populate ==> theres probably a better way to do this
          data.user = {username, userId,}
          return socket.broadcast.to(data.room).emit('RECEIVE_MESSAGE', data);
        })
        .catch(err => console.log(err))
        // broadcast new message
      })

      socket.on('SEND_EVENT', data => {
        controllers.event.post(data) // @TODO set this up as middleware
        // console.log(io.sockets.clients(data.roomId))
        return socket.broadcast.to(data.room).emit('RECEIVE_EVENT', data.event)
      })
    });

}

module.exports = sockets;
