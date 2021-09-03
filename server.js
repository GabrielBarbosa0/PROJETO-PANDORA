const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// definir pasta principal
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'BOT ';

// quando o cliente se conectar ao servidor
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // mensagem de boas vindas
    socket.emit('message', formatMessage(botName, 'Bem-vindo ao chat!'));

    // disparar mensagem quando outro usuario entrar no chat
   
    // socket.broadcast
    //   .to(user.room)
    //   .emit(
    //     'message',
    //     formatMessage(botName, `${user.username} entrou no chat`)
    //   );

    // informar os usuarios que esta na sala
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // listas de mensagem do chat
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // quando o usuario se desconecta da sala
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      // io.to(user.room).emit(
      //   'message',
      //   formatMessage(botName, `${user.username} saiu do chat`)
      // );


      // envio de dados do usuario para a sala
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 80;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
