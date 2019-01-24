import io from 'socket.io-client';

let url = 'http://localhost:3001'
if (process.env.NODE_ENV === 'production') {
  url = process.env.REACT_APP_SERVER_URL_PRODUCTION
} else if (process.env.NODE_ENV === 'staging') {
  url = process.env.REACT_APP_SERVER_URL_STAGING;
}
const socket = io.connect(url);
socket.removeAllListeners()
export default socket;

