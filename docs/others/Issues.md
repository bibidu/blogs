## @babel/preset-typescript
- 相关链接
  https://github.com/umijs/umi/issues/4042
- 复现代码
  ```js
  // a.ts
  export interface IProps {
    name: string
  }
  export const fn = () => {}
  // b.ts
  export { IProps, fn } from 'a.ts'
  // index.ts
  import 'b.js'

  // 报错信息
  warning  in /index.ts
  "export 'IProps' was not found in 'b.ts'"
  ```
- 原因分析

    接口定义IProps在编译时丢失
- 解决方案

    使用`export * 暴露`或等待`babel7.9支持`