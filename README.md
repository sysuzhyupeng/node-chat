demo使用
-
进入项目根目录`npm install`之后，使用`node server.js`启动应用，可在浏览器
localhost:3000中预览。使用`socket.io`实现一个聊天室，进行双工通信。
`socket.io`主要通过`on`来注册事件，使用`emit`来发射/触发事件。

事件发射器
-
一个Node HTTP服务器实例就是一个事件发射器，一个可以继承、能够添加事件发射及处理
能力的类（EventEmitter）。node的很多核心功能都继承自EventEmitter，我们也能创建自己的事件发射器。

node简介
-
node是以事件驱动和异步的模型来构建的。js从来没有过标准的I/O库，I/O库是服务端语言的常见配置。
node重新实现了宿主中那些常用的对象，比如计时器API(比如setTimeout)和控制台API(比如console.log)。
node还有一组用来处理多种网络和文件I/O的核心模块。其中包括用于HTTP、TLS、HTTPS、 文件系统(POSIX)、数据报(UDP)和NET(TCP)的模块。

http模块
-
Node的核心是一个强大的流式HTTP解析器，大概由1500行经过优化的C代码组成，这个解析器跟Node开放给JavaScript的底层TCP API相结合，提供了一个非常底层，但也非常灵活的HTTP服务器。

服务器每收到一条HTTP请求，都会用新的req和res对象触发请求回调函数。在触发回调函数之前，Node会解析请求的HTTP头，并将它们作为req对象的一部分提供给请求回调
。这时控制权交给回调函数。

node不会自动往客户端写任何响应。在调用完请求回调函数之后，就要由我们负责用`res.end()`方法结束响应了。

静态文件服务
-
像Apache和IIS之类传统的HTTP服务器首先是个文件服务器。每个静态文件服务器都有个根目录，也就是提供文件服务的基础目录。

`__dirname`是一个特别的变量，它的值是改文件所在目录的路径，在每个文件中的值不同。
下一步是得到URL的pathname，以确定被请求文件的路径。如果URL的pathname是
/index.html，并且我们的根目录是/var/www/example.com/public，用path模块的.join()方法把这些联接起来就能得到绝对路径/var/www/example.com/public/index.html。

有了文件的路径，还需要传输文件的内容。这可以用高层流式硬盘访问fs.ReadStream完成，它是Node中Stream类之一。
```
  var url = parse(req.url);
  var path = join(__dirname, url.pathname);
  var stream = fs.createReadStream(path);
  stream.on('data', function(chunk){
    res.write(chunk);
  })
```
除了readStream，node还提供了Stream.pipe()来优化文件传输。

formidable模块
-
文件上传也是一个非常常见的功能。要正确处理上传的文件， 并接收到文件的内容， 需要把表单的enctype属性设为multipart/form-data，这是个适用于BLOB（大型二进制文件）的MIME类型。

以高效流畅的方式解析文件上传请求并不是个简简单单的任务，Node社区中有几个可以完成这项任务的模块。formidable就是其中之一。Formidable的progress事件能给出收到的字节数，以及期望收到的字节数。我们可以借助这个做出一个进度条。
每次有progress事件激发，就会计算百分比并把进度传回到用户的浏览器中去。

数据存储
-
存储数据的方法很多：

 * 内存
 * 保存在文件中
 * 非关系数据库
 * 关系数据库管理系统（RDBMS）

Redis非常适合处理那些不需要长期访问的简单数据存储，比如短信和游戏中的数据。Redis把数据存在RAM中，并在磁盘中记录数据的变化。这样做的缺点是它的存储空间有限，但好处是数据操作非常快。如果Redis服务器崩溃，RAM中的内容丢了，可以用磁盘中的日志恢复数据。

连接redis数据库之后，可以马上用`client`对象操作数据。
```
  var redis = require('redis');
  var client = redis.createClient(6379, '127.0.0.1');

  client.set('camping', {
    'shelter': 1,
    'cooking': 2
  }, redis.print);
  client.get('camping', 'cooking', function(err, value){
    if(err) throw err;
    console.log('Cooking is ' + value);
  })
```
链表是Redis支持的另一种数据结构。如果内存足够大，Redis链表理论上可以存放40多亿条元素。

数据流
-
node在数据流和数据流动上也很强大。可以把数据流看成特殊的数组，只不过数组中的数据分散在空间上，而数据流中的数据是分散在时间上的。
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
exports只是对module.exports的一个全局引用，所以不能将exports指向其他引用
node中有一个独特的模块引入机制，可以不必知
道模块在文件系统中的具体位置。这个机制就是使用node_modules目录。

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
需要一个接着一个做的任务叫做串行任务。创建一个目录并往里放一个文件的任务就是串行的。我们不能在创建目录前往里放文件。
不需要一个接着一个做的任务叫做并行任务。这些任务彼此之间开始和结束的时间并不重要，但在后续逻辑执行之前它们应该全部做完。

下载几个文件然后把它们压缩到一个zip归档文件中就是并行任务。
为了让异步任务并行执行，仍然是要把任务放到数组中，但任务的存放顺序无关紧要。每个任务都应该调用处理器函数增加已完成任务的计数值。每个任务执行完都要检查是否计数值已经满足条件。

在node调用中，事务中存在串行任务的比比皆是：
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
  var counter = 2;
  var results = [];
  var done = function(index, value){
    result[index] = value;
    counter--;
    if(counter == 0){
      callback(null, results);
    }
  }
  //只传递第一个异常
  var hasErr = false;
  var fail = function(err){
    if(!hasErr){
      hasErr = true;
      callback(err);
    }
  }
  fs.readFile('file1.txt', 'utf-8', function(err, content){
    if(err){
      return fail(err);
    }
    //如果没有异常
    done(0, content);
  })
  fs.readFile('file2.txt', 'utf-8', function(err, content){
    if(err){
      return fail(err);
    }
    //如果没有异常
    done(1, content);
  })
```

内存控制
-
在v8中，所有的内存都是通过堆来分配的。通常造成内存泄漏的原因有以下几个：

 * 缓存
 * 队列消费不及时
 * 作用域未释放
 
缓存一旦命中，访问效率比I/O高。但是对于node来说，直接使用内存中的对象来做缓存与严格意义上的缓存又有区别，
因为严格意义的缓存有完善的过期策略，而普通对象并没有。所以这样使用时要严格注意。

Buffer
-
在node中需要处理网络协议、操作数据库、处理图片、接收上传文件等，js的String对象不能满足这些需求，也就有了`Buffer`对象。
`Buffer`对象类似于数组，它的元素为16位的二进制数，即0到255的值
```javascript]
  var str = '示例';
  var buf = new Buffer(str);
  console.log(buf);
```

网络编程
-
我们都知道TCP需要三次握手才能形成会话。可以在node中创建一个TCP服务器
```javascript
  var net = require('net');
  var server = net.createServer(function(socket){
    socket.on('data', function(data){
      console.log('hello');  
    })
    socket.on('end', function(data){
      console.log('end');  
    })
  })
```
HTTP构建在TCP上，属于应用层。在HTTP的两端是浏览器客户端和服务器，即著名的B/S模式。
node的http模块包含对http协议的封装。

Resful
-
rest的全称是Representational State Transfer，也就是表现层状态转化，符合rest设计的，我们称为restful设计。
它的设计主要将服务器提供的内容实体当做一个资源，并体现在URL上。过去我们对用户增删改查是这样的
```javascript
  POST /user/add?name=sysuzhyupeng
  GET /user/delete?name=sysuzhyupeng
  POST /user/update?name=sysuzhyupeng
  GET /user/get?name=sysuzhyupeng
```
而在restful设计中
```javascript
  POST /user/sysuzhyupeng
  DELETE /user/sysuzhyupeng
  PUT /user/sysuzhyupeng
  GET /user/sysuzhyupeng
```

中间件
-
中间件用来隔离基础设施与业务逻辑之间的细节，让开发者能够关注在业务的开发上，提升开发效率。比如记录访问日志、cookie、异常处理等。
Connect是一个框架，它使用被称为中间件的模块化组件，以可重用的方式实现Web程序中的逻辑。在Connect中，中间件组件是一个函数，它拦截HTTP服务器提供的请求和响应对象，执行逻辑，然后或者结束响应，或者把它传递给下一个中间件组件。

负载均衡
-
在多进程之间监听相同的端口，使得用户请求可以分散到多个进程上进行处理。node默认提供的机制是操作系统的抢占式策略。

状态共享
-
解决数据共享最直接的方式就是使用第三方来进行数据存储，比如把数据存放到数据库、磁盘文件、缓存服务等。存在的问题是如果数据改变，
还需要一种机制通知到多个子进程，轮询是一种解决方案。









