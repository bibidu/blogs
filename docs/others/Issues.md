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

## include of webpack loader
- 相关链接
  https://github.com/umijs/umi/pull/4327
- 复现代码
  ```js
  webpackConfig.module
    .rule('js')
      .test(/\.(js|mjs|jsx|ts|tsx)$/)
      .include.add(cwd).end()
      .exclude.add(/node_modules/).end()
  ```
- 原因分析

  指定了include项，则webpack只会匹配到include项对应的路径内容，其他路径的不匹配test

- 解决方案

  移除include项，依赖webpack自动查找依赖引用
  