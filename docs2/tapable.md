# 基础概念 

tapable 是 webpack 官方提供并集成进 webpack 的事件流插件库。通过 tapable 可以优雅的组织不同事件间的调用方式。 

# 特点 


* 具有丰富的内置事件间关系 

    * 同步执行 SyncHook 
    * 同步熔断执行 SyncBoilHook ( 顺序执行，返回 Boolean(true) 则结束 ) 
    * 异步并行 AsyncParallelHook ( 类似 Promise.all ) 
* 支持拦截器 
* 支持 HookHelper 方法 
* 实现方式为创建 函数字符串，进而通过 new Function 创建执行函数。( 解决超大型项目递归爆栈的问题) 
# 总结 

Tapable的源码较为简单。但相对于其他事件库，它具有一些特别的点： 


* 提供了几乎满足所有场景的事件间关系 
* api 的设计优雅，语义化效果出众 
* 实现方式较为特别，通过先 创建函数字符串，再通过 new Function 构建执行函数，以此解决递归爆栈的问题。 

