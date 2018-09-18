const controllers = require('./controllers')

const sockets = {};
sockets.init = server => {

    const io = require('socket.io')(server, {wsEngine: 'ws'}); // AHHHH FUCK YOU WINDOWS
    // without this wsEngine setting the socket events would be delayed upwards of 20 seconds // NOT SURE IF MAC DEVELOPERS WILL NEED TO REMOVE THIS
    io.sockets.on('connection', socket => {
      socket.on('JOIN', (data, callback) => {
        socket.join(data.roomId, () => {
          // update current users of this room
          controllers.room.addCurrentUsers(data.roomId, data.userId)
          .then(room => {
            socket.broadcast.to(data.roomId).emit('USER_JOINED', room.currentUsers);
            callback({result: room}, null)
          })
          .catch(err => callback(null, err))
        })
      });
      socket.on('LEAVE', (data, callback) => {
        socket.leave(data.roomId, () => {
          controllers.room.removeCurrentUsers(data.roomId, data.userId)
          .then(room => {
            console.log("room after disconnect: ",room);
            socket.broadcast.to(data.roomId).emit('USER_LEFT', room.currentUsers);
            callback({result: room.currentUsers})
          })
          .catch(err => console.log(err))
        })
      })
      socket.on('SEND_MESSAGE', (data, callback) => {
        const postData = {...data}
        postData.user = postData.user._id;
        controllers.message.post(postData)
        .then(res => {
          socket.broadcast.to(data.room).emit('RECEIVE_MESSAGE', data);
          callback('success', null)
        })
        .catch(err => {
          callback('fail', err)
          console.log(err)
        })
        // broadcast new message
      })

      socket.on('SEND_EVENT', (data) => {
        // console.log('receiving event: ', data)
        // console.log(typeof data.event)
        controllers.event.post(data) // @TODO set this up as middleware
        // console.log(io.sockets.clients(data.roomId))
        console.log(data)
        socket.broadcast.to(data.room).emit('RECEIVE_EVENT', data.event)
        // callback('success')
        console.log('success')
      })
    });

}

module.exports = sockets;
