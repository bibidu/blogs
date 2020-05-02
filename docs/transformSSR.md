- navigator不可用
- storage不可用
- client单端fetch不可用
- node_modules读取目录
  ```javascript
  modules: [
    path.resolve(__dirname, './node_modules'),
    './node_modules'
  ]
  ```
- window、location等不可用
- redux-saga的SSR使用方式
  ```javascript
  // store.js
  export default function configureStore() {
    // ...
    store.sagaTask = sagaMiddleware.run(sagas)
    return tore
  }

  // pageA.jsx
  import { END } from 'redux-saga'

  static fetchData = ({ store }) => {
    store.dispatch(asyncActionCreator())

    store.dispatch(END)
    return store.sagaTask.toPromise()
  }
  ```

- SSR过程中执行stringify，所以数组上绑定的变量会丢失(如 `list.hasNext`)