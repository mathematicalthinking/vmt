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

    leaveRoom: (roomId, userId) => {

    },

    sendMessage: (roomId, message) => {

    },

    sendEvent: (roomId, event) => {

    }
  },
  receive: {
    joinRoom: () => {socket.on('NEW_USER', newUser => {})}
  },
}
