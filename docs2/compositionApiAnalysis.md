- [ ] compositionApi 的基本概念 
- [ ] compositionApi 解决的问题 
- [ ] compositionApi 做了哪些工作 
- [ ] 核心 api 的实现 之 setup 
- [ ] 核心 api 的实现 之 reactive 
- [ ] 核心 api 的实现 之 watch 
- [ ] 核心 api 的实现 之 computed 
- [ ] 核心 api 的实现 之 mounted (...其他生命周期) 
- [ ] 核心 api 的实现 之 ref 
- [ ] 核心 api 的实现 之 toRef 
- [ ] 官方文档（ [https://composition-api.vuejs.org/zh/#ref-vs-reactive](https://composition-api.vuejs.org/zh/#ref-vs-reactive)）中 ref、reactive 的正确使用方法解读 

* compositionApi 的基本概念 

组合式 Api，提供了一种更灵活的方式组合组件的方式。作为一个 vue2.x 的插件使用，api 及实现与 vue3 基本相同，可以提前熟悉 vue3 的 api 并收集反馈。 


* compositionApi 解决的问题 

    * 更好的逻辑复用和代码组织 
    * 更好的类型推导 
* compositionApi 做了哪些工作 

    * 暴露一个 setup 函数选项，并能够在函数内部通过一系列的 api 来替代原 vue2.x 中的 data、computed、watch、生命周期选项。 
    * 添加 setup 的 optionMergeStrategies 策略 
    * 通过 Vue.mixin 混合 beforeCreate、mounted、updated 生命周期。即 setup 发生在 beforeCreate 生命周期。 
    * 在 beforeCreate 阶段，劫持 $options.data，在返回 data 前，执行 setup 的初始化工作。 
    * 给 $options.props 添加 reactive 标记，绑定 vue2.x 中 vm 作用域的一部分属性，如 attrs、refs、parent 等参数到 ctx。并将 props、ctx 传入 setup 函数并执行，将返回结果进行递归深层判断。具体细节参照下文： **核心 api 的实现 之 setup** 。 

* 核心 api 的实现 之 setup 

对 props 添加 reactive 标记。然后构造 ctx 上下文，并将 vm 上的 root、parent、refs、attrs、listeners、isServer、ssrContext 属性绑定到 ctx 上。然后讲props、ctx 传入 setup 方法，然后对执行的结果 binding 进行判断。 

首先将 binding 绑定到 vmStateManager 的 rawBindings 属性上。 

然后遍历 binding 的每个 key，保证每个 key 对应的值 ： 


    * 非 Ref 类型，且是 Reactive 类型，则包装成 Ref 类型。 
    * 非 Ref 类型，且非 Reactive 类型，且是函数类型： **则绑定 vm 作用域到函数。并添加 reactive 标记、添加 raw 标记，最后包装成 Ref 类型。** 
    * 非 Ref 类型，且非 Reactive 类型，且非函数类型。 **则添加 reactive 标记、添加 raw 标记，最后包装成 Ref 类型。** 

最后将修改后的 binding 绑定到 vm 上。 


* 核心 api 的实现 之 reactive 

对传入的对象进行监测，底层实现为： 

```plain
// vue2.6+ 
Vue.observable(obj) 
// vue2.6- 
new Vue({ 
  data: { 
    $$state: obj 
  } 
}) 
```
并对 obj 添加 reactive 标记 和 accessControl 标记。最后返回 监测后的 obj。 
* 核心 api 的实现 之 watch 

compositionApi 中的 watch 底层实现为 this.$watch 

* 核心 api 的实现 之 computed 

compositionApi 中的 computed 底层实现为： 

```javascript
new Vue({ 
  computed: { 
    $$state: { get, set } 
  } 
}) 
```

* 核心 api 的实现 之 mounted (...其他生命周期) 

compositionApi 中的 mounted 等生命周期方法 通过 vue 的 lifecycle optionMergeStrategies 进行合并。当执行了多次 mounted 时，compositionApi 会将多个相同生命周期进行 concat，依次执行。 

* 核心 api 的实现 之 ref 

先梳理下 ref 的用法： 

```javascript
export default { 
  setup() { 
    const msg = ref('') 
     
    return { msg } 
  } 
} 
```
对于传入 ref 的值，首先判断是否已经是 ref 类型（instanceof RefImpl），如是则直接返回。否则将该值包裹成一个对象，key 为 固定的 RefKey 字符串。然后传入 reactive 进行响应式监测。最后创建一个 RefImpl 实例，通过 proxy 代理 value 属性，值为 ref 传入的值。最后进行 Object.seal 封存（阻止添加新属性）。 


* 官方文档中 ref、reactive 的正确使用方法解读 
```javascript
// 组合函数： 
function useMousePosition() { 
const pos = reactive({ 
x: 0, 
y: 0, 
}) 
// ... 
return pos 
} 
// 消费者组件 
export default { 
setup() { 
// 这里会丢失响应性! 
const { x, y } = useMousePosition() 
return { 
x, 
y, 
} 
// 这里会丢失响应性! 
return { 
...useMousePosition(), 
} 
// 这是保持响应性的唯一办法！ 
// 你必须返回 `pos` 本身，并按 `pos.x` 和 `pos.y` 的方式在模板中引用 x 和 y。 
return { 
pos: useMousePosition(), 
} 
}, 
} 
```
**提出疑问：** 

    * 为什么通过 reactive 包裹的对象被其他组件引用时，解构的操作会导致响应失效？ 

由上文中 **reactive 的实现** 可知，reactive 实际做了两件事: observe 和 对 obj 添加标记。 

当返回的对象被解构之后，解构的值无法触发 get、set，比如： 

```plain
const obj = { name: '' } 
// 进行响应式监测 
observe(obj) 
obj.name // 触发 get 
obj.name = '' // 触发 set 
let { name } = obj 
name // 无法触发 get 
name = '' // 无法触发 set 
```
所以这就能解释，为什么经过 reactive 包裹后的对象，被解构后将无法触发 get、set。 

    * 为什么通过 ref 包裹的数据、toRef 包裹的数据 被解构后响应不会失效？ 

首先看看 ref 和 toRef 的使用方式： 

```javascript
// ref 的使用方式 
setup() { 
  const msg = ref('') 
  return { msg } 
} 
// toRef 的使用方式 
setup() { 
  const state = reactive({ msg: '' }) 
   
  return { 
    msg: toRef(state, 'msg') 
  } 
} 
```
**对于 ref：** 
由于 ref 接收的值类型是简单类型，首先要讲该值转化为对象： { RefKey: '' }，然后通过 reactive 进行响应式监测，接下来返回一个 RefImpl 的实例，然后通过 proxy 代理该对象的 value 属性，从而实现通过 msg.value = xxx 和 msg.value 进行赋值和取值。总结一下，通过调用 ref 函数，实现了： 


            * 可以通过 msg instanceof RefImpl 确定 msg 的类型（区分普通的字符串 和 被响应式监测且通过 proxy 代理了 value）【解构后的 msg 仍然是响应式，因为此时的 msg 是 RefImpl 实例且是个对象】 

**对于 toRef：** 

本质和 ref 的实现相同，不同的点在于 ref 需要将传入的基本类型的值 转化成对象 { RefKey: '' }，而 toRef 不需要做这一步，并且由于传入 toRef 的第一个参数已经是响应式的（被 reactive 包裹执行后），所以也不需要做 reactive 这一步。其他部分和 ref 的实现相同。 

