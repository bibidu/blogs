```javascript
activeWhen // 生效时机 

customProps // 自定义参数

ensureJQuerySupport // 确保是否是JQuery环境

appChangeUnderway // 应用正在进行更改操作

performAppChange // 执行应用更改动作(startAppChange)

eventArguments // 事件参数

isntLoaded // 没有加载过的

smellsLikeAPromise // 类似Promise

invokeLaterAndSetModuleName // 稍后调用并设置moduleName

assetNotHasOwnProperty // 断言不是hasOwnProperty

autoScrollingEnabled // 开启自动滚动

disableAutoScrolling // (action)关闭自动滚动

initRun // 首次运行(initEntry)

watchCollectionAction // 监听一系列行为

runInvokeQueue // 运行调用队列

useCachedOrUpdateOrCreateBundle // 使用缓存bundle或更新bundle或新的bungle

// 变量名结合语境，此处 usingObjectAPI 比 appParamIsObject 更好
const usingObjectAPI = typeof appNameOrConfig === 'object'

if (usingObjectAPI) {
  appName = appNameOrConfig.name
}
```