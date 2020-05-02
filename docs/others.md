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