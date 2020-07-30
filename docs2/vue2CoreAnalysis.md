- [ ] 数据监听变更的检测实现？ 
- [ ] watch、computed 的实现？ 

* 数据监听变更的检测实现？ 

vue2.x 对于数据监听变更检测的方案是借助浏览器提供的 api： Object.defineProperty 

```javascript
// 检测对象 obj 中的 key 属性 
let value = obj[key] 
Object.defineProperty(obj, key, { 
  get() { 
    return value 
  }, 
  set(newValue) { 
    value = newValue 
  } 
}) 
```
但是 Object.defineProperty 有缺陷，对于数组无法很好的检测。所以 vue2.x 对原生 Array 的检测是通过如下的方式： 

    * 对于数组进行遍历，对子元素需要进行变更检测的类型（如 Object、Array）进行 observe，其他类型数据不处理。对 Array 的各种原生添加、修改、删除方法进行劫持。 
    * 第一次页面渲染前，根据正则匹配 {{}} 内的变量并获取、渲染数据。 
    * 当通过 Array 原生方法修改时，进行劫持方法，然后对添加的数据再次进行递归 observe 检测。（检测类型是否满足，满足则进行 observe，否则不处理）。在最后执行 notify 操作，通过所有观察者（如 render），从而实现对数组进行变更检测。 

**注意：** 对于没有使用原生数组方法修改数组时，会导致 vue 无法检测到，从而带来 bug。所以 vue2.x 提供了 Vue.set 和 this.$set 进行数组变更操作，从而实现了监听其后续变更操作，但需要开发者手动调用。 


* watch、computed 的实现？ 

computed 和 watch 的底层都是通过 Watcher 这个类实现的。watch 的含义为：监听某个变量或变量的深层属性，当检测到变更时，重新执行 watch 函数。computed 的含义为：当 computed 函数中使用到的变量发生变更时，重新执行 computed 函数。使用方式举例： 

```javascript
export default { 
  data() { 
    return { 
      name: 'bibidu', 
      age: 12, 
    } 
  }, 
  computed: { 
    fullName: function() { 
      return this.name + this.age 
    } 
  }, 
  watch: { 
    age(newValue, oldValue) { 
      console.log('watch age updated') 
    } 
  }, 
  mounted() { 
    setTimeout(() => { 
      this.age = 13 
    }, 1000) 
  } 
} 
```
当编写如上所示代码后，首次渲染时，computed 中的 fullName 函数的返回值是 bibidu12。在 mounted 生命周期触发后，启动了一个定时器，1 s 后将 age 的值修改为 13。此时，由于 fullName 依赖了 age，所以，fullName 会重新执行，执行结果为 bibidu13。在 watch 对象中，声明了对 age 的监听，所以 age 函数会执行，并将 age 的新值 13 与 旧值 12 传入该函数，最终打印 watch age updated。 
通过上一个问题，我们知道了 vue2.x 可以通过 Object.defineProperty 对数据的 get、set 进行监听操作。那么 computed、watch 是如何与使用到的数据产生关联的呢？ 

通过分析可知，首先要找到 computed、watch 中依赖的数据，并和自身产生关联。下面写一下最简单的 computed 实现代码。 

```javascript
// 遍历上文中 export default 导出对象中的 computed 属性 
Object.keys(computed).forEach(name => { 
  const fn = computed[name] 
   
  // 设置当前将要执行的 computed 
  window.currentComputed = { name, fn } 
  // 执行 fn -> 会触发 name 和 age 的 getter 操作 
  fn() 
  // 清空已经执行过的 computed 
  window.currentComputed = null 
}) 
const watchers = [] 
let value = obj[key] 
Object.defineProperty(obj, key, { 
  get() { 
    // 当存在监听者时， 则将 该观察者 与 obj[key] 建立关联关系 
    if (window.currentComputed) { 
      watchers.push(window.currentComputed) 
    } 
   
    return value 
  }, 
  set(newValue) { 
    // 当 obj[key] 存在观察者时， 遍历观察者并执行对应 fn 方法 
    if (watchers) { 
      watchers.forEach(watcher => watcher.fn()) 
    } 
     
    value = newValue 
  } 
}) 
```
如上述代码，对于每一个对象的属性值，触发属性的 get 时，当获取值时，检查是否有 “观察者” ，如果存在，则将该 “观察者” 与该值产生关联关系。当触发属性的 set 时，通知 “观察者”  并重新执行对应的方法。至此，即可实现 computed 。 
对于 watch 的实现，不过是在 computed 的基础上，对 watch 的字符串进行 split('.') 并获取到最终的值，如 watch 一个 info.name 字符串时，实际监听的是 info 中的 name 属性，其它部分和 computed 几乎完全一样。另外 watch 还具有 immediate （首次渲染是否执行）等其它特性，但本质还是基于 Object.defineProperty 和 “发布-订阅” 模式来实现的。 

在 vue2.x 的源码中，对于数据监听、watch 和 computed 的实现 分拆出了三个文件，分别是 ： 


        * Proxy（数据监听） 
        * Watcher（存储 computed、watch 监听实例的各种属性，如 immediate 等） 
        * Dep（建立 数据 与 Watcher 之间的关联关系，用于代码解耦） 

在如上简单的代码实现基础上，做出的具体修改的部分有： 


    * 对于每个属性，如 obj[key] 都创建了一个 Dep 实例（用于保存 obj[key] 与 观察者的关系），即 const dep = new Dep()。 
    * 创建一个 Watcher 实例，并将 computed 的名称、函数、immediate 等配置传入，得到 watcher。 
    * 将 computed 添加到 window.currentComputed 的操作，改为 Dep.target = watcher。 
    * 触发 get 时，判断 window.currentComputed 是否存在并添加到 watchers 中的操作，改为 dep.depend()。 
    * 触发 set 时，遍历 watchers 并执行 fn 的操作，改为 dep.notify()。 

通过上述修改，即可实现： 


    * 代码解耦 
    * 封装 Watcher 类用于 computed、watch 共同复用 

