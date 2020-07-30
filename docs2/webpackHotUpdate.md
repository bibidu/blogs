- [ ] webpack 热更新的整体流程？ 
- [ ] webpack 热更新如何检测文件变更？ 
- [ ] webpack 热更新如何判断文件是否更新？ 

* webpack 热更新的整体流程 

    * 首先，需要启用 webpack-dev-server 和 webpackReplacementPlugin 
    * 然后，webpack-dev-server 会在代码中插入一段内联 script 脚本，用于创建客户端的 socket ，并与 webpack-dev-server 的 服务端 socket 进行连接。 
    * 添加如下代码表示，对 ./App.js 入口进行热更新检查，当监测到文件变更时，执行更新操作。 
```javascript
// ------ index.js ------ 
if (module.hot) { 
  module.hot.accept('./App.js', () => { 
    console.log('hot update start ...') 
  }) 
} 
```

    * webpack 通过 fs.watch 监听到以 ./App.js 为入口的文件变动，然后通过对比该文件当前内容的 hash 值与之前缓存的内容 hash 值，当不一致时，内嵌的 script 脚本重新请求 webpack-dev-server 最新的文件内容，随后执行 accept 第二个参数代表的回调函数。 

* webpack 热更新如何检测文件变更？ 

webpack 通过 fs.watch 实现监听文件变更。 


* webpack 热更新如何判断文件是否更新？ 

通过对比该文件当前内容的 hash 值与之前缓存的内容 hash 值是否相同。 

