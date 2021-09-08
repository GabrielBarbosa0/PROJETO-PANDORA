const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const roomNameMobile = document.getElementById('room-name-mobile');
const userListMobile = document.getElementById('users-mobile');

// pegar o nome do usuario e sala pela URL
let { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if(room == ""){
  for (var i = 2; i > 0; --i) room += (Math.floor(Math.random()*256)).toString(16);
  room += "-";
  for (var i = 2; i > 0; --i) room += (Math.floor(Math.random()*256)).toString(16);
  room += "-";
  for (var i = 2; i > 0; --i) room += (Math.floor(Math.random()*256)).toString(16);
  let url = "/chat.html?username="
  url += username;
  url += "&room=";
  url += room;
  window.location.href = url;
}

const socket = io();

// entrar na sala de chat
socket.emit('joinRoom', { username, room });

// pegar a sala e os usuarios da sala
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// enviar mensagem para o servidor
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // rolar chat
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// mensagem enviada
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // pegar mensagem de texto
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // enviar mensagem para o servidor
  socket.emit('chatMessage', msg);

  // limpar input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// mostrar mensagem na pagina
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span> ${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// adicionar nome da sala
function outputRoomName(room) {
  roomName.innerText = room;
  roomNameMobile.innerText = room;
}

// adicionar usuarios na sala
function outputUsers(users) {
  userList.innerHTML = '';
  userListMobile.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userListMobile.appendChild(li);
  });
}

// quando clicar no botao sair
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Tem certeza que deseja sair dessa sala?');
  if (leaveRoom) {
    window.location = '../index.html';
  } 
});

function menuMobile(){
  const btn = document.getElementById('chat-mobile');
  if (btn.style.display == 'none') {
    btn.style.display = 'inline-block';    
  }else{
    btn.style.display = 'none';
  }
}
