## 使用方式
- 配置 `HotModuleReplacementPlugin` 插件
- 开启 `webpack-dev-server`

  ```javascript
  const path = require('path')
  const HtmlWebpackPlugin = require('html-webpack-plugin')

  module.exports = {
    mode: 'development',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
      filename: 'bundle.js',
      path: path.join(__dirname, 'dist')
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html'
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
      port: 9000,
      hot: true,
    }
  }
  ```

## Q&A

  ### 热更新实现原理
  页面中注入热更新js并与服务端建立socket连接，当检测到文件变化后，服务端通过socket通信告知客户端，进而客户端请求并获取到最新文件，最终通过script标签插入body中实现热更新

  ### 如何监听到文件变化
  通过 node `fs.watch` 监听到文件变化

  ### 如何判断文件是否修改
  通过对可能变更的文件内容进行基于content的hash值计算，进而比对hash值判断是否修改


  ### module.hot.accept回调只执行一次的原因

  - 复现

  `App.js` 第二次变更时，module.hot.accept的回调不会触发

    ```javascript
    // current file path: src/index.js
    require('./App')

    if (module.hot) {
      console.log('hot')
      module.hot.accept('./App', function(hasChangedFilePaths) {
        console.log('[***]Accepting the updated module!');
      })
    }
    // App.js
    document.body.innerText = 'dxz12'
    ```

  - 解释

  这是hot-module-reload的特性。当通过 `module.hot.accept` 传入需要监测变更的文件后，在该文件第一次变更发生时，客户端可获取到该文件的变更结果。但当开发者未在accept的回调中 `再次` 调用该文件时，HMR会将文件的变更回调移除。（即当可以监听到文件再次变化，但不会通过回调函数告知开发者）
  
  - 解决方案

  如需每次变更均执行回调，可修改代码为：

  ```javascript
    module.hot.accept('./App', function(hasChangedFilePaths) {
      console.log('[***]Accepting the updated printMe module!');
      require('./App')
    })
  ```
