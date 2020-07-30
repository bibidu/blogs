
* 浏览器端 api 不可用，如 window / location / navigator 
* 浏览器端缓存不可用，如 storage 
* 单端 http 请求库不可用，如 fetch 
* SSR 预获取数据需要 JSON.stringify 后放到 window，所以数组上绑定的变量会丢失。 
```javascript
const list = [] 
list.hasNext = true 
const stringifiedList = JSON.parse(JSON.stringify(list)) 
assert(stringifiedList.hasNext).equal(undefined) 
```

* 类似 Zeit/next 的 SSR 框架，在内置 server 入口时，找不到传入插件配置的 node_modules 目录。可通过在 webpack 配置 node_modules 的读取目录 
```javascript
{ 
  modules: [ 
    path.resolve(__dirname, './node_modules'), 
    './node_modules' 
  ] 
} 
```

* redux-saga 与 SSR 结合 
```javascript
// store.js 
export default function configureStore() { 
  store.sagaTask = sagaMiddleware.run(sagas) 
  return tore 
} 
// pageA.jsx 
import { END } from 'redux-saga' 
export default class extends Component { 
   
  static fetchData = ({ store }) => { 
    store.dispatch(asyncActionCreator()) 
    store.dispatch(END) 
     
    return store.sagaTask.toPromise() 
  } 
} 
```
