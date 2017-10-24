//用来显示可疑文本
function divEscapedContentElement(message){
	return $('<div></div>').text(message);
}
function divSystemContentElement(message){
	return $('<div></div>').html('<i>' + message + '</i>')
}