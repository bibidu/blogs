# 前言 

众所周知，对一个包含函数的对象进行 JSON.stringify 后，会导致函数消失。那么有没有什么办法能保存原对象中的函数呢？ 


# 关于 JSON.stringify 

JSON.stringify 的第二个参数允许传入自定义的转换逻辑。 

# 思路 

通过添加自定义的 stringify 逻辑：对函数进行 toString() 操作，再添加唯一标识符，最后再替换掉标识符实现保存原对象中的函数。 

# 代码实现 

```javascript
function stringify AndParse (value, replacer, space = '') { 
 const  uniqueIdenfier = '__fn__' 
// 替换value中的function为 '__fn__' + function字符串 
replacer = function(k, v) { 
if (typeof v === 'function') { 
return u n iqueIdenfier + v.toString() 
} 
return v 
} 
 
    let result = JSON.stringify(value, replacer, space) 
result = JSON.parse(result) 
 
let finalRst = {}, v = '' 
Object.keys(result).forEach(key => { 
v = result[key] 
if (v.toString().includes(fnIdentifier)) { 
v = v.replace(fnIdentifier, '') 
 // 通过 eval 亦可, eval(`v = ${v}`) 
             v = new Function(`return ${v}`)() 
         } 
finalRst[key] = v 
}) 
return finalRst 
} 
```
# 总结 

核心思路： 


    * 通过 JSON.stringify 的第二个参数自定义格式化逻辑。 
    * 借助 eval 或 new Function 实现创建 由字符串构成的函数。 
