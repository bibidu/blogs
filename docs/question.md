## 旧项目中babel import语法编译错误的分析

### 环境
```javascript
// .babelrc
{
  presets: ['react-native']
}
```

```javascript
// package.json
{
  dependencies: {
    "react-native": "0.44.0"
  },
  devDependencies: {
    "babel-core": "6.26.3",
    "babel-preset-react-native": "4.0.0"
  }
}
```

### 最小重现demo

```javascript
import styles from './selectFormItemStyles'

class SelectFormItem {
  // 改为a(styles) {} 后 编译会正常
  a(styles = {}) {
  }

  render() {
    // 该styles未被正确编译
    styles.dxz
  }
}
```
- 编译结果

```javascript
// ignore nouse code ...
var _selectFormItemStyles = require('./selectFormItemStyles');
var _selectFormItemStyles2 = _interopRequireDefault(_selectFormItemStyles); 

var SelectFormItem = function () {

_createClass(SelectFormItem, [{
  key: 'a',
  value: function a() {
    var styles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  }
}, {
  key: 'render',
  value: function render() {
    styles.dxz;
  }
}]);

  return SelectFormItem;
}();
```

可以看到编译后，`render` 函数中的 `styles.dxz` 并没有被修改为 `_selectFormItemStyles2.dxz`

### 原因分析
`styles.dxz` 编译错误的原因可能是: a函数中的 `形参默认值` 导致编译import语法时没有正确的替换render中对styles的引用。由于只使用到了 `babel-preset-react-native": "@4.0.0"` 插件，而该插件是facebook封装的一系列的babel插件合集，所以考虑将当前编译错误环境实际使用到的插件剥离出，最终定位到编译错误的插件。

剥离后的demo
```javascript
const babel = require("babel-core")

const { code: res } = babel.transform(code, {
  plugins: [
    'transform-es2015-block-scoping',
    'transform-es2015-parameters',
    [
      'transform-es2015-modules-commonjs',
      { strict: false, allowTopLevelThis: true }
    ],
    'transform-es2015-classes',
  ]
})
```

上述四个插件在当前demo中的作用：
- *transform-es2015-block-scoping*

  将 let/const 转换为 var

- *transform-es2015-parameters*

  将函数的默认形参 转换为 函数内的arguments

- *transform-es2015-modules-commonjs*

  将import语法 转换为 require

- *transform-es2015-classes*

  将class语法 转换为 protopype

测试后发现，当只开启 `transform-es2015-modules-commonjs` 插件进行编译，编译结果正常。

此时查看`transform-es2015-modules-commonjs`是如何对import语法进行编译的

```javascript
// ignore nouse code
exports.default = function() {
  return {
    Program: {

      // 在其他插件均编译完毕后 再进行import语法编译
      exit(path){
        const imports = {}
        const body = path.get('body')
        for (let i = 0; i < body.length; i++) {
          const _path = body[i]

          // 查找import语法
          if (_path.isImportDeclaration()) {
            const key = _path.node.source.value

            // 保存该import信息到 imports
            imports[key] = path.node /* general meaning */

            // 移除该import语法
            _path.remove()
          }
        }

        // 遍历收集到的imports节点，替换成require语法
        for (let source in imports) {
          buildRequire(t.stringLiteral(source))
        }

        // 遍历所有节点中引用到import的资源name，并进行命名的替换
        path.traverse({
          AssignmentExpression(path) {
            const left = path.get('left')
            if (left.isIdentifier()) {
              const name = left.node.name

              // 调用 `babel-traverse` 的getBinding判断 当前的资源名是否和import的资源名是同一个作用域
              if (this.scope.getBinding(name) !== path.scope.getBinding(name))
                return
            } else {

              // ignore other branches analysis
            }
          }
        })
      }
    }
  }
}
```

汇总之前的结论及该插件源码发现
- 单独使用`transform-es2015-modules-commonjs`编译并无错误
- 代码中引用了import声明的资源名是通过 `babel-traverse` 的 `getBinding` 进行判断的
- 该插件的执行顺序在最后

此时提出猜想，另外的三个插件导致 `babel-traverse` 的 `getBinding` (获取当前变量绑定的作用域)判断发生错误。

由于 `babel-traverse` 代码量较多，考虑先从三个插件入手，查找可能会导致作用域变化的代码。查看代码后发现，在 `transform-es2015-block-scoping` 插件中有对作用域进行提升的操作：

```javascript
// ignore unuse code
function convertBlockScopedToVar(path, node, parent, scope) {

  // 是否需要移动作用域到父级
  const moveBindingsToParent = arguments.length > 4 && ...

  if (moveBindingsToParent) {

    // 获取父级函数的作用域
    var parentScope = scope.getFunctionParent();

    // 获取需要替换引用资源名的变量
    var ids = path.getBindingIdentifiers();
    for (var name in ids) {

      // 获取自身的绑定
      var binding = scope.getOwnBinding(name);
      if (binding) binding.kind = "var";

      // 移动当前变量的作用域到父级
      scope.moveBindingTo(name, parentScope);
    }
  }
}
```

通过上述代码可知：
- 对引用了和 `import` 相同资源名的变量执行 `babel-traverse` 中的 `moveBindingTo` 方法来提升该变量的作用域

通过在 `moveBindingTo` 前添加日志发现，编译错误的 styles.dxz 的 `binging` 为undefined，由此猜测：另外两个插件的转换操作 该变量的 `OwnBinding` 发生丢失。

分析后猜想 当 `OwnBingding` 不存在时，不进行 moveBingingTo 提升作用域的操作，可解决此问题。

### 解决方案

```javascript
// babel-plugin-transform-es2015-block-scoping@6.26.0/lib/index.js#L132
for (var name in ids) {
  var binding = scope.getOwnBinding(name);
  if (binding) binding.kind = "var";

+  if (binding) {
     scope.moveBindingTo(name, parentScope);
+  }
}
```

修改后发现 `styles.dxz` 被正确的转换为 `_selectFormItemStyles2.default.dxz`

### 总结

- 分析过程

  上述分析没有完整的查看 `babel-traverse` 及其他插件的代码，有错误的地方欢迎指正。

- 其他方案

  由于该项目很久没有维护，使用的仍然是6.x版本的babel，测试后发现 `babel-preset-react-native` 升级到5.x版本提示babel需要7.x版本，升级babel后发现此问题消失。

  


