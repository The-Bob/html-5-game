const express = require('express');
const app = express();
const serv = require('http').Server(app);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log('Server started');

var SOCKET_LIST = [];




class Entity {
	constructor (id){
		this.x = 250, this.y = 250;
		this.id = id;
		this.spdX = 0, this.spdY = 0;

	}
	update() {
		this.updatePosition();
	}
	updatePosition() {
		this.x += this.spdX;
		this.y += this.spdY;
	}

}



class Player extends Entity {
	constructor (id){
		super();

		this.id =  id;
		this.number =  '' + Math.floor(10 * Math.random());
		this.pressingRight = false;
		this.pressingLeft = false;
		this.pressingUp = false;
		this.pressingDown = false;
		this.maxSpd = 10;
		Player.list.set(id,this);

	}

	updateSpd() {
		if(this.pressingUp)
			this.spdY = -this.maxSpd;
		else if (this.pressingDown)
			this.spdY = this.maxSpd;
		else
			this.spdY = 0;

		if(this.pressingRight)
			this.spdX = this.maxSpd;
		else if (this.pressingLeft)
			this.spdX = -this.maxSpd;
		else
			this.spdX = 0;

	}

	update(){
		this.updateSpd();
		this.updatePosition();
	}


	static onConnect (socket) {
		console.log("connected");
		var player = new Player(socket.id);
		socket.on('keyPress', (data) => {
			if (data.inputId === 'up')
				player.pressingUp = data.state;
			else if (data.inputId === 'right')
					player.pressingRight = data.state;
			else if (data.inputId === 'down')
					player.pressingDown = data.state;
			else if (data.inputId === 'left')
					player.pressingLeft = data.state;
		});
	}

	static onDisconnect (socket){
		Player.list.delete(socket.id);
	}

	static Update (){
		var pack = [];
		for(var key of Player.list.keys()){
			var player = Player.list.get(key);
			player.update();
			pack.push({
				x: player.x,
				y: player.y,
				number: player.number
			});
		}

		return pack;
	}
}
Player.list = new Map();




class Bullet extends Entity {
	constructor(angle){
		super();
		this.id = Math.random();
		this.spdX = Math.cos(angle/180*Math.PI) * 10;
		this.spdY = Math.sin(angle/180*Math.PI) * 10;

		this.timer = 0;
		this.toRemove = false;
		var super_update = this.update();

		Bullet.list.set(this.id, this);
	}

	update (){
		if (this.timer++ > 100){
			this.toRemove = true;
		}
		this.updatePosition();
	}

	static Update (){
		if(Math.random()<0.05){
			var b = Math.random()*360;
			var a = new Bullet(b);

		}

		var pack = [];
		for(var key of Bullet.list.keys()){
			var bullet = Bullet.list.get(key);

			bullet.update();
			pack.push({
				x: bullet.x,
				y: bullet.y,
			});
		}

		return pack;
	}
}
Bullet.list = new Map();

var io = require('socket.io')(serv, {});
io.sockets.on('connection', (socket) => {
	console.log('socket connection');

	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);

	socket.on('disconnect', () => {
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

	socket.on('sendMsgToServer', (data) => {
		console.log("message recieved");
		var playerName = (''+socket.id).slice(2,7);
		io.sockets.emit('addToChat', `${playerName} says: ${data}`);
	});

	socket.on('evalServer', (data) => {
		socket.emit('addToChat', eval(data));
	});
});

setInterval(() => {
	var pack = {
		player:Player.Update(),
		bullet:Bullet.Update()
	}
	for (var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);
	}
}, 1000/25)
