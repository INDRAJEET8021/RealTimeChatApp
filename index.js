require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');


const app = express();
const port = process.env.PORT||4500 ;
//console.log(process.env.PORT);

app.use(cors());

const users = {};

app.get("/", (req, res) => {
  res.send('Hello is working');
});

const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on('Joined', ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has Joined`);
    socket.broadcast.emit('userJoined', { user: "Admin", message: `${user} has joined` });
    socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${user}` });
  });

  socket.on('message',({message,id})=>{
    io.emit('sendMessage',{user:users[id],message,id})
  })

  socket.on('disconnect', () => {
    const disconnectedUser = users[socket.id];
    delete users[socket.id];
    if (disconnectedUser) {
      console.log(`${disconnectedUser} has left`);
      socket.broadcast.emit('leave', { user: "Admin", message: `${disconnectedUser} has left` });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
