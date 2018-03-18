const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

var ctx = document.getElementById('ctx').getContext('2d');
ctx.font = '30px Arial';

var socket = io();

socket.on('addToChat', (data) =>{
	chatBox.innerHTML += `<div class="chatText">${data}<div\\>`;
});

chatForm.onsubmit = (e) => {
	e.preventDefault();

	socket.emit('sendMsgToServer', chatInput.value);
	chatInput.value = '';

	if(chatInput.value[0] === "/"){
		socket.emit('evalServer', chatInput.value.slice(1));
	}
}

socket.on('newPositions', (data) => {
	ctx.clearRect(0,0,500,500);
	for(var i = 0; i < data.player.length; i++){
		ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y);
	}
	for(var i = 0; i < data.bullet.length; i++){
		ctx.fillRect(data.bullet[i].x-5, data.bullet[i].y-5,10,10);
	}


});

document.onkeydown = (event) => {
	if(event.keyCode === 87)
		socket.emit('keyPress',{inputId: 'up', state: true}); //W
	else if(event.keyCode === 68)
		socket.emit('keyPress',{inputId: 'right', state: true}); //D
	else if(event.keyCode === 83)
		socket.emit('keyPress',{inputId: 'down', state: true}); //S
	else if(event.keyCode === 65)
		socket.emit('keyPress',{inputId: 'left', state: true}); //A
}

document.onkeyup = (event) => {
	if(event.keyCode === 87)
		socket.emit('keyPress',{inputId: 'up', state: false}); //W
	else if(event.keyCode === 68)
		socket.emit('keyPress',{inputId: 'right', state: false});//D
	else if(event.keyCode === 83)
		socket.emit('keyPress',{inputId: 'down', state: false});//S
	else if(event.keyCode === 65)
		socket.emit('keyPress',{inputId: 'left', state: false});//A
}
