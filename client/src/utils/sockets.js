// import io from 'socket.io-client';

let url = 'http://localhost:3001';
if (process.env.REACT_APP_STAGING) {
  url = process.env.REACT_APP_SERVER_URL_STAGING;
} else if (process.env.REACT_APP_TEST) {
  url = 'http://localhost:3001';
} else if (process.env.NODE_ENV === 'production') {
  url = process.env.REACT_APP_SERVER_URL_PRODUCTION;
}

// legacy config
// const socket = io.connect(url);

// updated config that includes options object, includes long polling connection
// const socket = io(url);
const io = require('socket.io-client');

const socket = io(url, {
  withCredentials: true,
});
// helper socket methods to print socket messages
// const socket = {
//   emit: (message, payload_1, payload_2) => {
//     console.log('Send', message, payload_1, payload_2);
//     return _socket.emit(message, payload_1, payload_2);
//   },
//   on: (message, payload) => {
//     const newPayload = (msg) => {
//       console.log('Received:', message, msg);
//       payload(msg);
//     };
//     return _socket.on(message, newPayload);
//   },
//   removeAllListeners: (message) => {
//     console.log('removed listener:', message);
//     return _socket.removeAllListeners(message);
//   },
// };

export default socket;
