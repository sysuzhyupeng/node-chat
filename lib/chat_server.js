var socketio = require('socket.io');
var io;
var guestNumber = 1;
//key为socket.id，value为name
var nickNames = {};
var nameUsed = [];
//Key为socket.id, value为room
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
function handleNameChangeAttemps(socket, nickNames, nameUsed){
	socket.on('nameAttemps', function(name){
		if(name.indexOf('Guest') == 0){
			socket.emit('nameResult', {
				success: false,
				message: 'Name cannot begin without "Guest".'
			});
		} else {
			//在用过名字中没有发现
			if(nameUsed.indexOf(name) == -1){
				var previousName = nickNames[socket.id];
				//获得原来的索引，便于删除
				var previousNameIndex = nameUsed.indexOf(previousName);
				nameUsed.push(name);
				nickNames[socket.id] = name;
				delete nameUsed[previousNameIndex];
				socket.emit('nameResult', {
					success: true,
					name: name 
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is known as ' + name + '.'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'The name is already in use.'
				});
			}
		}
	})
}