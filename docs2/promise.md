# promise值得注意的特性 

- [ ] promise支持链式调用 
```plain
new Promise(() => {}) 
  .then(() => {}) 
  .then(() => {}) 
```
- [ ] promise的then回调链中可以返回另一个promise 
```plain
const sleep = ms => new Promise(r => setTimeout(r, ms)) 
new Promise(() => sleep(1000)) 
  .then(() => return sleep(3000)) 
```
- [ ] 已知 new Promise 传入的函数立即执行，then 链条中的函数属于js eventloop 的微任务，那么如何对 Promise 进行 polyfill ? 
- [ ] Promise.resolve 与 Promise.reject 是什么? 
# 分析promise的特性 


* promise支持链式调用 

通过返回 this 的方式实现链式调用 

```plain
class Promise { 
  constructor(fn) { 
     
  } 
  then(fn) { 
    return this 
  } 
} 
```

* promise的then回调链中可以返回另一个promise 

promise是用来替代回调函数来解决异步问题的。没有手动调用 promise 的 resolve 方法时，后续的 then 链条需要处于等待状态。即 Promise 的 then 方法实现中需要判断传入的函数是否需要被立即执行。 

```javascript
// case 1 
new Promise(() => console.log('A')) 
  .then(() => console.log('B')) 
// case 1 的 then 方法 接收到参数时就应该将其放入 `微任务` 队列立即执行。因为该 then 链条前的 promise 已经打印了 A 并且执行完毕。 
// case 2 
const promiseA = sleep(1000).then(() => console.log('A')) 
new Promise(() => promiseA) 
  .then(() => console.log('B')) 
// case 2 的 then 方法 接收到参数时，不能直接将其 放入 `微任务` 队列。因为此时该 then 链条前的 promise 并没有执行结束，所以需要暂时将该参数缓存，当前面执行完毕时，检查是否有缓存中等待执行的任务，有则将其放入 `微任务` 队列并执行它。 
```
```javascript
class Promise { 
  _state = 0 // 0: PENDING; 1: FULFILLED; 2: REJECTED 
  _result = null // resolve 或 reject 的值 
  _subscribers = [] // 等待执行的 then 任务 
   
  constructor(fn) { 
    // 立即执行传入 Promise 构造函数的参数 
    const res = fn((r) => this.resolve(r), (r) => this.reject(r)) 
    if (res instanceof Promise &&) 
  } 
  
  resolve(value) { 
    if (this._state !== 0) return 
    this._state = 1 
     
    this.publish() 
  } 
   
  publish() { 
    // 没有等待执行的任务 当再次传入 then 任务时，then 处可通过判断 _state 可立即执行 
    if (this._subscribers.length === 0) return 
     
    for (let i = 0; i < this._subscribers.length; i += 3) { 
      const promise = this._subscribers[i] 
      // _state: 1 表示 获取 resolve； 
      // _state: 2 表示 获取 reject； 
      const callback = this._subscribers[i + this._state] 
       
      value = callback(this._result) 
      // resolve 或 reject 另一个 promise 
      if (isPromise(value)) { 
        // 添加订阅回调，当该 promise 状态改变时执行回调 
        value._subscribers.push([ 
          value, 
          (value) => this.resolve(value), 
          (reason) => this.reject(reason), 
        ]) 
      }     
    } 
  } 
   
  then(onfulfillment, onRejection) { 
    // 没有执行过 resolve 和 reject，所以需要把 then 的参数加入 subscribers 队列 
    if (this._state === 0) { 
      _subscribers.push([this, onfulfillment, onRejection]) 
    } else { 
      asap(() => ) 
    } 
  } 
} 
```

* Promise.resolve 与 Promise.reject 是什么? 

分别是 new Promise(resolve => resolve(value)) 和 new Promise((_, reject) => reject(reason)) 的语法糖。 

