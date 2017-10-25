/*
	客户端主要解决两个问题：
	1. 向服务器发送用户的消息和昵称/房间变更请求
	2. 显示其他用户的消息，以及可用房间的列表

	在input中可以键入两种消息
	1.以/开头的为命令，比如进入其他聊天室，更换昵称
	2.不以/开头的为发送消息
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
	//把开头的/去掉
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
			//将/nick shift出去之后去除空格
			var name = words.join(' ');
			this.socket.emit('nameAttempts', name);
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
		//其他为普通聊天消息
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
	/*
		在新用户分配昵称之后
		或者变更昵称之后
	*/
	socket.on('nameResult', function(result){
		var message = '';
		if(result.success){
			message = 'You are known as ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#message').append(divSystemContentElement(message));
	});
	socket.on('joinResult', function(result){
		$('#room').text(result.room);
		$('#message').append('Room changed');
	});
	socket.on('message', function(message){
		//有消息过来创建一个新div插入message
		var newElement = $('<div></div>').text(message.text);
		/*
			新用户进入
			打印所有用户信息
		*/
		$('#message').append(newElement);
	});
	socket.on('rooms', function(rooms){
		//room-list中保存进入
		$('#room-list').empty();
		for(var room in rooms){
			room = room.substring(1, room.length);
			if(room != ''){
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		//点击房间切换
		$('#room-list div').on('click', function(event) {
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});
	//定期请求可用房间列表
	setInterval(function(){
		socket.emit('rooms');
	}, 1000);
	$('#send-message').focus();
	$('#send-form').submit(function(event) {
		processUserInput(chatApp, socket);
		return false;
	});
})