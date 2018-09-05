import io from 'socket.io-client';
let socket;
const connect = () => {
  socket = io.connect(process.env.REACT_APP_SERVER_URL);
};

export default {
  emit: {
    joinRoom: (roomId, userId, username) => {
      connect();
      const data = {
        roomId,
        user: {_id: userId, username,}
      }

      return new Promise((resolve, reject) => {socket.emit('JOIN', data, (res, err) => {
        if (err) return reject(err);
        console.log(res)
        resolve(res)
      })})
    },

    leaveRoom: (roomId, userId, username) => {
      const data = {roomId, user: {_id: userId, username,}}
      return new Promise((resolve, reject) => {
        socket.emit('LEAVE', data, (res, err) => {
          resolve(res)
        })
      })
    },

    sendMessage: (roomId, message) => {

    },

    sendEvent: (roomId, event) => {

    }
  },
  receive: {
    joinRoom: () => {
      socket.on('USER_JOINED', newUser => {
        console.log('A NEW USER JOINED ', newUser)
      })
    },
    leaveRoom: () => {
      socket.on('USER_LEFT', data => {
        console.log("ANOTHER USER LEFT: ", data)
      })
    }
  },
}
