const app = '../app.js';
const io = app.io;

io.on('connection', socket => {
  console.log("as user connected: ", socket.id);
  socket.on('JOIN', (room) => {
    console.log("JOIN: ",room)
    socket.join(room)
  });
  socket.on('SEND_MESSAGE', (data) => {
    console.log(data)
    socket.broadcast.to(data.room).emit('RECEIVE_MESSAGE', data);
  })
})
