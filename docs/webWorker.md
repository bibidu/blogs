## 定义
Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。`等到 Worker 线程完成计算任务，再把结果返回给主线程`。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。

## 注意点
- 同源限制
- DOM限制
- 通信联系
- 脚本限制
- 文件限制

## 实例
```javascript
function maybePerformSlowly() {
  const sleep = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms))
  sleep().then(() => {
    self.postMessage(Array(20).fill('').map(item => ({ name: 'dxz' })))
  })
}

const blob = new Blob([`(${maybePerformSlowly.toString()})()`])
const url = window.URL.createObjectURL(blob)
const worker = new Worker(url)
worker.onmessage = (ev) => {
  console.log(`get message from Worker`, ev.data)
}
```