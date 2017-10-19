# node-demo
Node从构建开始就有一个事件驱动和异步的模型。JavaScript从来没有过标准的I/O库，那是服务端语言的常见配置。
Node重新实现了宿主中那些常用的对象，比如计时器API(比如setTimeout)和控制台API(比如console.log)。
Node还有一组用来处理多种网络和文件I/O的核心模块。其中包括用于HTTP、TLS、HTTPS、 文件系统(POSIX)、数据报(UDP)和NET(TCP)的模块。

数据流
-
Node在数据流和数据流动上也很强大。你可以把数据流看成特殊的数组，只不过数组中的数据分散在空间上，而数据流中的数据是分散在时间上的。
通过将数据一块一块地传送，开发人员可以每收到一块数据就开始处理
```javascript
  var stream = fs.createReadStream('./json');
  stream.on('data', function(chunk){
    //每当有数据过来都会触发data事件
    console.log(chunk);
  })
  stream.on('end', function(){
    console.log('finished');
  })
```


