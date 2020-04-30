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



## babel async配置
- use
  ```bash
  npm i babel-loader @babel/preset-env @babel/plugin-transform-runtime @babel/plugin-proposal-class-properties -D
  ```

  ```javascript
  {
    test: /\.(js)$/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          ['@babel/preset-env', {
            "targets": {
              "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
            },
          }],
        ],
        plugins: [
          ["@babel/plugin-transform-runtime"],
          ["@babel/plugin-proposal-decorators", { "legacy": true }],
          ['@babel/plugin-proposal-class-properties'],
        ]
      }
    },
    exclude: /node_modules/
  }
  ```

  ## Edge安装Chrome扩展插件
  - 找到对应Chrome插件的ID

    如ID: `ichgjhjfgnfmnikpoajjoiemklopmhgj`

  - 替换结尾处 `%3D` 和 `%26` 之间的部分为 ID
  ```
  https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromecrx&prodchannel=&prodversion=77.0.3865.90&lang=zh-CN&acceptformat=crx2,crx3&x=id%3D replace %26installsource%3Dondemand%26uc
  ```

  - 访问该网站即开始下载crx后缀的插件文件

  - 修改后缀名 crx 为 zip

  - 通过解压缩软件解压( 如 `ezip` )即可得到完整插件包

  - 打开Edge扩展，点击 `加载解压缩的扩展`，选择解压后的插件包即可安装