var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var nameUsed = [];
var currentRoom = {};

exports.listen = function(server){
	//socket搭载在目前服务器
	io = socketio.listen(server);
	//限定控制台输出日志的详细程度
	io.set('log level', 1);
	//监听连接事件
	io.sockets.on('connection', function(socket){
		guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed);
		joinRoom(socket, 'room1');
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttemps(socket, nickNames, nameUsed);
		handleRoomJoining(socket);
		sockets.on('rooms', function(){
			socket.emit('rooms', io.sockets.manage.rooms);
		});
		handleClientDisconnetion(socket, )
	})
}
//以socket.id来串联，所以几个方法都需要传入socket参数
//为新用户分配昵称
function assignGuestName(socket, guestNumber, nickNames, nameUsed){
	var name = 'Guest' + guestNumber;
	//把用户名称和socket.id关联上
	nickNames[socket.id] = name;
	//触发nameResult事件
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	nameUsed.push(name);
	return ++guestNumber;
}
//新用户加入房间
function joinRoom(socket, room){
	socket.join(room);
	//保存目前socket.id在哪个房间
	currentRoom[socket.id] = room;
	socket.emit('joinResult', {
		room: room
	});
	//让整个房间用户知道新用户进来了
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id]
	});
	//获得所有用户
	var userInRoom = io.socket.clients(room);
	if(userInRoom.length > 1){
		var userInRoomSummary = ' User currently in' + room + ';';
		for(var index in userInRoom){
			var userSocketId = userInRoom[index].id;
			if(userSocketId != socket.id){
				if(index > 0){
					userInRoomSummary += ', ';
				}
				userInRoomSummary += nickNames[userSocketId];
			}
		}
		userInRoomSummary += '.';
		//广播所有用户信息
		socket.emit('message', {
			text: userInRoomSummary
		});
	}
}
//处理变更名称请求
