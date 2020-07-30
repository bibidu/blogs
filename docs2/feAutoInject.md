# 依赖注入的实现 

`依赖注入` 的概念来源于后端，指的是依赖的模块或数据不需要手动引用，而可以通过声明的方式实现 `自动注入` 。随着后端思想进入前端后，前端也有了 `依赖注入` 的概念。 

典型的 `依赖注入` 实现可参照 `angularJS` . 

# 依赖注入 的工作方式 

在 `angularJS` 中通常分为两种形式： 


* 通过函数的形参声明 
* 通过依赖项名称的字符串数组 + 函数的形参声明 
### 通过函数的形参声明 

```javascript
app.controller('myController', function($scope) { 
  // 此处即可使用注入的 $scope 
  $scope 
}) 
```
在 angularJS 中，可以通过 app.controller 声明一个控制器。该控制器的第一个参数表示名称是 myController，第二个参数是一个匿名函数，该函数的形参为 $scope，在该函数内即可使用 $scope。angularJS 会在初始化的过程中自动注入 $scope。 
### 通过依赖项名称的字符串数组 + 函数的形参声明 

```javascript
app.controller('myController', ['$scope'], function($scope) { 
  // 此处即可使用注入的 $scope 
  $scope 
}) 
```
和 *通过函数的形参声明* 不同的是，参数中添加了一个数组类型的 $scope。由于 javascript 在编译的过程中，可能会使用到类似 uglifyJS 的代码压缩工具，如果使用 *通过函数的形参声明* 去自动注入时，可能会被压缩成如下的代码： 
```javascript
app.controller('myController', function(_a) { 
  _a 
}) 
```
简单来说，由于 angularJS 依赖注入的方式是将函数进行 `toString()` 后 截取 形参部分的，所以截取后无法找到依赖的 `_a` 模块的。所以，更推荐使用 `依赖项名称的字符串数组 + 函数的形参声明` 方式来进行依赖注入。 
# 依赖注入的工作原理 

```javascript
app.controller('myController', function($scope) { 
  // 此处即可使用注入的 $scope 
  $scope 
}) 
```
首先，需要将 app.controller 的第二个参数进行 `toString()` ，转换成： 
```javascript
const fnString = `function($scope) { 
  $scope 
}` 
```
然后，会通过正则匹配函数的形参： 
```javascript
// 匹配函数的形参部分 
const GET_DEP_REG = /function\s+(\w*)\s*\((.*)\)/ 
```
我们通过正则匹配到了函数所需注入依赖的 名称字符串，接下来只需要通过该名称找到对应的依赖，并在执行该函数的时候，传入对应依赖作为实参即可实现依赖注入。 
# 总结 

通过对 `angularJS` 的代码分析可以得出，前端的依赖注入思路大致分两步，分别是 **对函数进行** `toString()` 以及 **通过正则匹配到形参** 。由于前端代码压缩的限制，所以更推荐奖依赖项作为一个字符串单独传入以防止压缩后找不到函数形参所对应的真实依赖项。  

