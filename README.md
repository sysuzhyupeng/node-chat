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

单线程
-
在node线程中，无法与其他线程共享状态，单线程的最大好处是不用考虑状态的同步问题，这里没有死锁的存在，也没有线程上下文切换的的性能开销。如果创建多线程的开销小于并行执行，那么多线程是首选的。而在I/O密集应用中，由于每个线程都要占用一定的内存，当大并发请求到来时，内存会很快用光。而单线程主要有以下缺点：

 * 错误会导致整个应用退出
 * 无法利用多核cpu
 
像浏览器中js与UI共用一个线程一样，js长时间执行会导致UI的渲染和响应被中断。node和chrome的解决方案相似，都是利用子进程来进行大量计算任务的执行。

模块化
-
每个模块中都有`require`、`exports`、`module`和`__filename`等变量，他们是怎么来的呢？在编译的时候，node对文件进行了头尾包装
```javascript
  (function(exports, require, module, __filename, __dirname){
    var module1 = require('module1');
    exports.fn =  function(param){
      return module1(param);
    }
  })
```

JSON文件编译
-
通过fs模块获得JSON文件的内容之后，通过`JSON.parse`得到对象，挂载到`exports`对象上

高阶函数
-
当我们想检测一个变量类型的时候，比起多次书写`isXXX`方法，一个高阶函数会更简洁
```javascript
  var isType = function(type){
    return function(obj){
       return toString.call(obj) == '[object ' + type + ']';
    }
  }
  var isString = isType('String');
  var isFunction = isType('function');
```

node异常处理
-
在我们处理异常的时候，通常使用类java的`try/catch`
```javascript
   try {
     JSON.parse(json);
   } catch(e){
     //todo
   }
```
但是在异步编程中，异步I/O的实现主要有两个阶段：提交请求和处理结果。这两个阶段有事件循环的调度，异步方法在第一个阶段之后就返回，因为异常不一定发生在这个阶段，所以`try/catch`不会有任何作用。异步方法的定义如下：
```javascript
  var async = function(callback){
     process.nextTick(callback);
  }
  //调用的时候
  try {
    async(callback);
  } catch(e){
    //todo
  }
```
于是node在异常处理形成一种约定，将异常作为回调函数的第一个参数返回，如果为空值，则表明异步调用没有异常抛出。

异步嵌套过深
-
在node调用中，事务中存在异步操作的比比皆是
```javascript
  fs.readdir(path.join(__dirname, '..'), 'utf-8', function(err, files){
    db.query(sql, function(err, data){
      //other async
    })
  })
```
有几个方法可以解决这个问题，比如事件的发布/订阅模式，node提供的`events`模块是发布/订阅的简单模式实现
```javascript
  emmiter.on('event1', function(messagge){
    console.log(message);
  })
  emmiter.emit('event1', 'msg!');
```
同时这个模式也是一种钩子（hook），利用钩子导出内部的数据给外部调用。
还有`promise`也是一个解决方案。

async
-
async提供了`series()`方法来实现一串任务的串行执行
```javascript
  async.series([
    function(){
      fs.readFile('file1.txt', 'utf-8', callback);
    },
    function(){
      fs.readFile('file2.txt', 'utf-8', callback);
    }
  ], function(err, results){
    // results为[file1.txt, file2.txt]
  })
```
当我们需要并行的时候，async提供了`parallel`方法，它的调用等价于以下代码
```javascript
  
```





