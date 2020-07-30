
* 使用自定义的全局参数简化代码 
```javascript
// 代码逻辑 
if (__DEV__) { 
  console.error('') 
} 
// .eslintrc (globals属性用于避免no-def报错) 
{ 
  "globals": { 
    "__DEV__": true 
  } 
} 
// 构建工具replace插件替换 
{ 
  plugins: [ 
    replace({ 
      __DEV__: process.env.NODE_ENV === 'production' 
    }) 
  ] 
} 
```

* 不额外申请一个对象的内存 
```javascript
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

* 添加类的静态方法用于创建实例 
```javascript
// create static function replace class call directly 
class ReactToReactNative { 
  static create(...args) { 
    return new ReactToReactNative().init(...args).start() 
  } 
} 
```

