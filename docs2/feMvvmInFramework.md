- [ ] vue 
- [ ] react 
- [ ] angularJS 
- [ ] wepy1.x 

* vue 

vue 通过浏览器提供的 api： Object.defineProperty 或 Proxy 实现。框架层自动实现，无需开发者参与。 


* react 

react 通过开发者手动调用 setState 实现。开发者需手动操作。 


* angularJS 

angularJS 通过劫持 dom 事件、定时器、生命周期等，然后框架层执行 $apply 进行脏检查。框架层自动实现，无需开发者参与。但某些场景下性能问题严重。 


* wepy1.x 

wepy1.x 通过对所有生命周期函数及开发者自定义函数进行劫持，在函数执行完毕后执行 $apply，属于 angularJS 的升级版，性能问题较 angularJS 稍好。但对于异步场景的更新仍然需要开发者手动调用 $apply。属于半自动。 

