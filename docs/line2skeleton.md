# 思路

- 绘制满屏canvas、添加 `mousedown` `mousemove` `mouseup` 事件
- 记录每次 绘制记录的坐标点
- 渲染时，遍历每一次绘制记录的坐标点，调用 `document.elementFromPoint`获取当前点对应的 dom 元素
- 以该 dom 元素为基准，向上寻找3次父节点或直到body节点结束，即 `element.parentNode`
- 对当前绘制所有记录点匹配到的元素进行排序，取匹配次数最多且最小的元素作为骨架屏元素
- 绘制样式到骨架屏即可

# 预览图
<video src="/line2skeleton.mp4" autoplay loop controls style="width: 600px;border:1px solid;" />