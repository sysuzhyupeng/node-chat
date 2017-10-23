var http = require('http');
var fs = require('fs');
//path模块提供了与文件系统路径相关功能
var path = require('path');
//mime模块有根据文件扩展名得出MIME类型的能力
var mime = require('mime');

/*
	用来缓存文件内容，访问内存(RAM)要比访问文件系统快得多，所以Node程序通常会把常用的数据缓存到内存里。
	这里设置为全局变量
*/
var cache = {};

/*
	在创建HTTP服务器时，需要给createServer传入一个匿名函数作为回调函数，
	由它来处 理每个HTTP请求。这个回调函数接受两个参数:request和response。
*/
var server = http.createServer(function(req, res){
	var filePath = false;
	if(req.url == '/'){
		//url后面不加任何路径时的默认主页
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + req.url;
	}
	var absPath = './' + filePath;
	serveStatic(res, cache, absPath);
});

//使用 node server.js启动即可
server.listen(8080, function(){
	console.log('server listen on port 8080');
});



/*
	启动 Socket.IO服务器，给它提供一个已经定义好的HTTP服务器，这样它就能跟HTTP服务器共享同一 个TCP/IP端口
*/
var chatServer = require('./lib/chat_server');
chatServer.listen(server);

function send404(res){
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.write('Error 404');
	res.end();
}

//在http response中加入文件
function sendFile(res, filePath, fileContents){
	//发送文件需要设置正确的文件类型头部
	res.writeHead(200, {
		'Content-Type': mime.lookup(path.basename(filePath))
	});
	res.end(fileContents);
}
//返回静态文件
function serveStatic(res, cache, absPath){
	//检查内存中是否存在文件
	if(cache[absPath]){
		sendFile(res, absPath, cache[absPath]);
	} else {
		//检查是否存在文件
		fs.exists(absPath, function(exists){
			if(exists){
				fs.readFile(absPath, function(err, data){
					if(err){
						send404(res);
					} else {
						//先保存在内存中
						cache[absPath] = data;
						sendFile(res, absPath, cache[absPath]);
					}
				})
			} else {
				send404(res);
			}
		})
	}
}
