/*
	socket.io 是一个为实时应用提供跨平台实时通信的库。
	socket.io 旨在使实时应用在每个浏览器和移动设备上成为可能，
	模糊不同的传输机制之间的差异。
	因为并不是所有的浏览器都支持 WebSocket ，所以该库支持一系列降级功能
*/

//socket.io通过互相发射事件来进行通信
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
		//绑定轮询房间列表事件
		socket.on('rooms', function(){
			socket.emit('rooms', io.sockets.manager.rooms);
		});
		handleClientDisconnetion(socket);
	})
}
//以socket.id来串联，所以几个方法都需要传入socket参数
//为新用户分配昵称
function assignGuestName(socket, guestNumber, nickNames, nameUsed){
	var name = 'Guest' + guestNumber;
	//把用户名称和socket.id关联上
	nickNames[socket.id] = name;
	//触发nameResult事件，在客户端绑定
	socket.emit('nameResult', {
		success: true,
		name: name
	});
	nameUsed.push(name);
	return guestNumber + 1;
}
//新用户加入房间
function joinRoom(socket, room){
	//Adds the client to the room
	//客户端加入房间
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
	var userInRoom = io.sockets.clients(room);
	//每次浏览器刷新都会生成新的用户
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
		//在客户端打印所有用户信息
		socket.emit('message', {
			text: userInRoomSummary
		});
	}
}
/*
	用户发射一个message事件，
	表明消息是从哪个房间发出来的，以及消息的内容是什么
	然后服务器将这条消息转发给同一房间的所有用户。
*/
function handleMessageBroadcasting(socket, nickNames){
	socket.on('message', function(message){
		socket.broadcast.to(message.room).emit('message', {
			text: nickNames[socket.id] + ': ' + message.txt
		});
	});
}
/*
	让用户加入已有房间的逻辑，如果房间还没有的话，则创建一个房间。
*/
function handleRoomJoining(socket){
	socket.on('join', function(room){
		socket.leave(currentRoom[socket.id]);
		joinRoom(socket, room.newRoom);
	});
}
/*
	用户离开聊天程序的时候，删除用户昵称
*/
function handleClientDisconnetion(socket){
	socket.on('disconnect', function(){
		var nameIndex = nameUsed.indexOf(nickNames[socket.id]);
		//在数组中删除元素必须知道index
		delete nameUsed[nameIndex];
		delete nickNames[socket.id];
	})
}
//处理变更名称请求
function handleNameChangeAttemps(socket, nickNames, nameUsed){
	//注册名称变更事件（attempt企图）
	socket.on('nameAttempts', function(name){
		if(name.indexOf('Guest') != 0){
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
	});
}