var express = require('express');
var app = express();
var serv = require('http').Server(app);
var port = process.env.PORT || 2000;

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(port);
console.log('Server started');

var SOCKET_LIST = [];

var io = require('socket.io')(serv, {});
io.sockets.on('connection', (socket) => {
	console.log('socket connection');

	socket.id = Math.random();
	socket.x = 0;
	socket.y = 0;
	socket.number = '' + Math.floor(10 * Math.random());
	SOCKET_LIST[socket.id] = socket;

	socket.on('disconnect', () => {
		delete SOCKET_LIST[socket.id];
	});
});

setInterval(() => {
	var pack = [];
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.x += 1;
		socket.y += 1;
		pack.push({
			x: socket.x,
			y: socket.y,
			number: socket.number,
		});
	}

	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);
	}
}, 1000/25)
