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
	//发送message事件，服务器端接收
	this.socket.emit('message', message);
}
Chat.prototype.changeRoom = function(room){
	//发送join事件
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
			var room = words.join(' ');
			this.changeRoom(room);
			break;
		case 'nick':
			words.shift();
			var name = words.join(' ');
			//
			this.socket.emit('nameAttempt', name);
			break;
		default:
			message = 'unrecognized command';
			break;
	}
	return message;
}
//处理用户原始输入
function processUserInput(chatApp, socket){
	var message = $('#send-message').val();
	var systemMessage;
	//以斜杠开头作为聊天命令
	if(message.charAt(0) == '/'){
		systemMessage = chatApp.processCommand(message);
		if(systemMessage){
			$('#message').append(divSystemContentElement(message));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#message').append(divEscapedContentElement(message));
		$('#message').scrollTop($('#message').prop('scrollHeight'));
	}
	$('#send-message').val('');
}

var socket = io.connect();
$(document).ready(function(){
	var chatApp = new Chat(socket);
	//绑定socket事件，由服务器端触发
	socket.on('nameResult', function(result){
		var message;
	})
})