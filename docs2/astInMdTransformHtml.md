### 1. 引言 


---


`markdown` 的语法相较其他来说，更简单、直接。市面上有很多的 `markdown` 转 `html` 工具。但各家的 转换工具都只有固定的转换样式，而支持自定义样式的转换工具，如 `markdown-it` 虽然支持配置插件 来实现样式自定义，但门槛稍高，需要了解 其插件api。所以希望做一款支持： 


1. 上手难度低 
2. 配置灵活 
3. 实时预览 

的 `markdown` 转 `html` 工具。 该工具名称暂定 `@md2html` 。 

### 2. 原理 

>整体的执行过程，与我们常说的 `javascript` 中的 `AST` 转换步骤 **完全相同** ， 只是针对的语言从 `javascript` 换成了 `markdown` 。 

* 将 `markdown` 分解为 `语法树` (用于描述markdown语法的json数据结构) 
* 遍历 `语法树` ，在对应的语法节点执行 `转换` 的操作（转换后的html需要具有样式属性） 
* 拼装 `转换` 后的 `html标签` 与 `自定义的CSS样式` 成完整的 `html文件` 并输出 
* 构建Web markdown转换站点，监听 `change` 事件，重复上述步骤以实现在线转换 
### 3. 技术栈 


---



* `remark` 用于将 `markdown` 文本转换为 `语法树` 
* `@md2html/traverse` 接收 `remark` 产出的 `语法树` ，并提供类似 `@babel/traverse` 的api 用于遍历所有节点 
* `@md2html/parse` 通过添加一系列的markdown 节点遍历操作，来实现 `转换` 的核心步骤 
### 4. 原理图 


---


### 5. 代码分析 


---


#### 如何得到 `markdown` 的语法树 

```javascript
import remark from 'remark' 
const md = '# 标题' 
const ast = remark().parse(md) 
   
```
#### 如何遍历 ast 

由于没有找到具有类似 `@babel/traverse` 的遍历ast的库，所以考虑自己写一个简单的 `mardown-traverse` 


* 方法信息 
```javascript
// 函数名：traverse 
// 入参: 
//   @param1: AST [markdown的JSON结构语法树] 
//   @param2: visitors [遍历对象，key对应 语法树中的节点类型，value类型是函数，传入该节点信息] 
       
```

* AST 结构及 visitors 结构 
```javascript
// ast 
{ 
  "type": "root", // 节点类型(根节点) 
  "children": [ // 子节点 
    { 
      "type": "heading", // 节点类型(h1/h2/h3/h4/h5/h6) 
      "depth": 1, // 节点的相关信息 
      "children": [] 
    } 
  ] 
} 
// visitors 
{ 
  /* node: 该节点信息； utils: 遍历时 `mardown-traverse` 提供的工具方法 */ 
  heading(node, utils) { 
    const { depth } = node 
  } 
} 
       
```

* 核心代码 
```javascript
function traverse(ast, visitors, parentNode = null) { 
  // 提供给visitors的工具方法 
  const util = { 
    parentNode: parentNode, // 记录当前节点的父亲 
    // ... 
  } 
  if (visitors[ast.type]) { 
    // 进入该节点 
    if (visitors[ast.type].enter) { 
      visitors[ast.type].enter(ast, util) 
    } 
  } 
  if (ast.children && ast.children.length) { 
    ast.children.map(child => traverse(child, visitors, ast)) 
  } 
  if (visitors[ast.type]) { 
    // 离开该节点 
    if (visitors[ast.type].leave) { 
      visitors[ast.type].leave(ast, util) 
    } 
  } 
} 
       
```
#### 如何替换节点 

以 `# 标题` 为例，该markdown 对应的 节点是 `heading` , 只需要在上述传入的visitors中配置 `heading` 节点的替换逻辑即可。 

```javascript
const result = [] 
traverse(ast, { 
  heading: { 
    // 实际 util中封装了对不同标签的标签名转换及样式转换，此处仅为举例说明流程 
    enter(node, util) { 
      const tagName = `h${node.depth}` 
      const style = `class="md2html-${tagName}"` 
      result.push(`<${tagName} ${style}>`) // <h1> 
    }, 
    leave(node, util) { 
      result.push(`</h${node.depth}>`) // </h1> 
    } 
  } 
}) 
   
```
至此，基本完成了 `heading` 节点的转换逻辑。 
#### 如何实现样式灵活可配置 （非重点） 

通过上一步可观察到 `# 标题` 的最终标签具有该属性： `class="md2html-h1"` , 因此只需要配置一段 CSS, 具有以下代码即可实现。 

```plain
.md2html-h1{ /* 具体样式*/ } 
```
 
