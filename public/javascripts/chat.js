/*
	客户端主要解决两个问题：
	1. 向服务器发送用户的消息和昵称/房间变更请求
	2. 显示其他用户的消息，以及可用房间的列表
*/

var Chat = function(socket){
	this.socket = socket;
}
Chat.prototype.sendMessage = function(room, text){
	var message = {
		room: room,
		text: text
	}
	this.socket.emit('message', message);
}
Chat.prototype.changeRoom = function(room){
	this.socket.emit('join', {
		newRoom: room
	});
}
//处理聊天命令
Chat.prototype.processCommand = function(command){
	var words = command.split(' ');
	var command = words[0].substring(1, words[0].length).toLowerCase();
	var message = false;
	switch(command){
		case 'join': 
			words.shift();
	}
}