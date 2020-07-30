# 基本概念 

Koa 中间件 来源于 koa-compose 库。下面通过一个 koa 的中间件的使用案例来分析 koa-compose 源码层面是如何实现的。 


# 使用案例 

```javascript
const sleep = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)) 
// 日志中间件 
async function logMiddleware(ctx, next) { 
  console.log('logMiddleware start'); 
  ctx.middlewares.push('logMiddleware') 
  await sleep() 
  await next() 
  console.log('logMiddleware over'); 
} 
// cookie中间件 
async function cookieMiddleware(ctx = {}, next) { 
  console.log('cookieMiddleware start'); 
  ctx.middlewares.push('cookieMiddleware') 
  ctx.hasCookie = Boolean(ctx.headers.cookies) 
  await sleep() 
  await next() 
  console.log('cookieMiddleware over'); 
} 
// 注册中间件 
const app = new Koa() 
app.use(logMiddleware) 
app.use(requestMiddleware) 
```

# 使用分析 


* 首先 koa 中间件是一个函数，第一个参数是 ctx ，表示上下文的请求信息。第二个参数是一个回调函数，当前中间件执行完毕时，可手动调用该函数来执行后续中间件。 
* koa 中间件 支持编写 promise，所以 第二个参数 next 执行后返回的可能是一个 promise。 
# 核心源码 

```javascript
function Koa() { 
this.middlewares = [] 
} 
Koa.prototype.use = function(middleware) { 
this.middlewares.push(middleware) 
} 
Koa.prototype.sendRequest = function(ctx = {}) { 
let index = 0, middlewares = this.middlewares 
function dispatch(index) { 
if (index < middlewares.length) { 
return middlewares[index](ctx, dispatch.bind(null, index + 1)) 
} else { 
return Promise.resolve() 
} 
} 
return dispatch(index) 
} 
```
# 源码分析 


* 首先通过 use 方法将传入的中间件函数保存在 middlewares 数组中 
* 内部 sendRequest 是 koa 中间件的初始触发函数。在该函数内部，声明了一个 dispatch 函数。 
* 由于 middlewares 是传入的中间件数组，middlewares[index] (index 为中间件数组的下标)表示了第x个中间件。初始时应当执行第一个中间件，所以执行 dispatch(0) 。由于当前中间件的第一个参数是 ctx，所以 middlewares[index] 的第一个参数为 ctx。而第二个参数 next 是一个函数，当手动执行该函数时，即可执行下一个中间件。所以传入的值为 dispatch.bind(null, index + 1)。 
* 最终当所有中间件执行完毕后，返回 Promise.resolve。 
