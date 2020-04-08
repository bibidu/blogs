### 使用自定义的全局参数简化代码

```js
// 代码逻辑
if (__DEV__) {
  console.error('')
}
```
```js
// .eslintrc (globals属性用于避免no-def报错)
{
  "globals": {
    "__DEV__": true
  }
}
```
```js
// 构建工具replace插件替换
{
  plugins: [
    replace({
      __DEV__: process.env.NODE_ENV === 'production'
    })
  ]
}
```

### 不额外申请一个对象的内存
```jsx
function assign() {
  for (let i = arguments.length - 1; i > 0; i--) {
    for (let key in arguments[i]) {
      if (key === "__proto__") {
        continue;
      }
      {/* highlight-start */}
      arguments[i - 1][key] = arguments[i][key];
      {/* highlight-end */}
    }
  }

  return arguments[0];
}
```

### 添加类的静态方法用于创建实例
```js
// create static function replace class call directly
class ReactToReactNative {
  static create(...args) {
    return new ReactToReactNative().init(...args).start()
  }
}
```

### exports暴露方式
```js
exports.omit = (...args) => {}

exports.omitWithDefValue = (...args) => {
  const value = exports.omit(...args)
  return value || []
}
```

### 基于class的方法绑定
```javascript
// 基类
class BaseServer {
  constructor(server) {
    this.server = server
  }
}
// 扩展类
class SockJSServer extends BaseServer {
  constructor(server) {
    super(server)
    this.logger = this.server.logger
  }
}

// 测试
class T {
  constructor() {
    this.logger = createLogger()
    const server = new SockJSServer(this)
  }
}
```