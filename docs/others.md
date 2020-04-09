## 关于CSR渐进式接入SSR

### 介绍
- 原 CSR 项目基于 `react`、`redux`、`saga`、`thunk`
- 打包工具内嵌在 `node_modules/tz_compile_cli`
- 生产打包部署后，通过 `node_modules/tz_service_cli` 启动 express服务进行部署

### 期望
期望小成本的接入 SSR

### 实践
初始考虑开发一个支持渐进式接入 SSR 的 `npm包`，通过在原项目中引入实现。

但考虑后发现无法实现，代码如下：
```
├─ node_modules
│  ├─ tz_service_cli
├─ src
│  └─ src
│     └─ pages
│        └─ pageA
```

```javascript
// pageA
import Component_A from '@comps/A'
import utils from '@utils'

@connect()
export default class extends Component {
  constructor(p) { super(p) }

  async componentWillMount() {}
}
```
想要对 pageA 进行 SSR 渲染必须引入 `pageA`, 但对应的babel配置、路径配置都通过 CSR 代码的webpack中管理。所以原本考虑拆分出一个 渐进式接入 SSR 的 `npm包` 无法实现。

最终方案定为 **在原项目中搭建服务**，弃用依赖中的 `tz_service_cli`。该服务根据路由判断 CSR | SSR 渲染。