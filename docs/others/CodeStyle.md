## 命名
```js
activeWhen // 生效时机 

customProps // 自定义参数

ensureJQuerySupport // 确保是否是JQuery环境

appChangeUnderway // 应用正在进行更改操作

performAppChange // 执行应用更改动作(startAppChange)

eventArguments // 事件参数

isntLoaded // 没有加载过的

smellsLikeAPromise // 类似Promise

// 变量名结合语境，此处 usingObjectAPI 比 appParamIsObject 更好
const usingObjectAPI = typeof appNameOrConfig === 'object'

if (usingObjectAPI) {
  appName = appNameOrConfig.name
}
```
## Tips
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
```js
function assign() {
  for (let i = arguments.length - 1; i > 0; i--) {
    for (let key in arguments[i]) {
      if (key === "__proto__") {
        continue;
      }
      arguments[i - 1][key] = arguments[i][key];
    }
  }

  return arguments[0];
}
```

## 代码写法

### static
```js
class ReactToReactNative {
  static create(...args) {
    return new ReactToReactNative().init(...args).start()
  }
}
```

### exports
```js
exports.omit = (...args) => {}

exports.omitWithDefValue = (...args) => {
  const value = exports.omit(...args)
  return value || []
}
```
