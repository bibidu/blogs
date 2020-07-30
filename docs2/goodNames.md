
* activeWhen 生效时机 
* customProps 自定义参数 
* ensureJQuerySupport 确保是否是JQuery环境 
* appChangeUnderway 应用正在进行更改操作 
* performAppChange 执行应用更改操作( startAppChange ) 
* eventArguments 事件参数 
* isntLoaded 没有加载过的 
* smellLikeAPromise 类Promise 
* invokeLaterAndSetModuleName 稍后调用并设置moduleName 
* assetNotHasOwnProperty 确定没有hasOwnProperty 
* enableAutoScrolling / disableAutoScrolling 开启 / 关闭自动滚动 
* initRun 首次运行 
* watchCollectionAction 监听一系列行为 
* runInvokeQueue 运行调用队列 
* useCachedOrUpdateOrCreateBundle  使用缓存bundle或更新bundle或新的bundle 
```javascript
// 变量名的命名应结合整体代码语义，而非当前行的代码 
// 此处 usingObjectAPI 比 appParamIsObject 更好 
const usingObjectAPI = typeof appNameOrConfig === 'object' 
if (usingObjectAPI) { 
  appName = appNameOrConfig.name 
} 
```
