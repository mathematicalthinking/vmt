import io from 'socket.io-client';

console.log('connecting')

const socket = io.connect(process.env.REACT_APP_SERVER_URL);
socket.removeAllListeners()
export default socket;

