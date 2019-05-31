import io from 'socket.io-client';

let url = 'http://localhost:3001';
if (process.env.REACT_APP_STAGING) {
  url = process.env.REACT_APP_SERVER_URL_STAGING;
} else if (process.env.REACT_APP_TEST) {
  url = 'http://localhost:3001';
} else if (process.env.NODE_ENV === 'production') {
  url = process.env.REACT_APP_SERVER_URL_PRODUCTION;
}

// eslint-disable-next-line no-console
console.log('SOCKET URL: ', url);
const socket = io.connect(url);

export default socket;
