# 基于react的动态树（react-dynamic-tree）

> 参考了“阿里宜搭” 的概念，使用树的样式代替原来表格的样式，可以动态扩展节点。

**主要技术点：**

| 类型       | 名称                                                |
| :--------- | :-------------------------------------------------- |
| MVVM 框架  | react@^18.2.0                                       |
| UI 框架    | antd@^4.21.7                                       |

## 特点

1. 增加拖拽功能。简化修改步骤。
2. 增加折叠功能。方便聚焦关注点。
3. 增加简介功能。结合折叠功能，将复杂逻辑化繁为简。简单逻辑一目了然。
4. 使用括号样式，代替“括号复选框”，更好表达同级的逻辑关系。
5. 一键新建分组逻辑，减少操作步骤。
6. 增加新逻辑的按钮从尾部改到实际增加的位置，减小误操作。整体内容更加紧凑，减少空间浪费和关注点飘移。

![](https://github.com/iqingsong/react-dynamic-tree/blob/master/src/assets/jpg/react-tree3.jpg)

## 安装

```shell
npm install
```

## 运行

```shell
npm run start
```

## 用法

```react
import React from 'react'
import { useState } from 'react'
import Tree from './components/DynamicTree/Tree'

function App() {
  const defaultData = {
    isExpand: true,
    children: [
      {
        children: [],
        operator: 'length less than',
        value: '123',
        valueMethod: '',
        valueType: 'NUMBER',
        _value: '123',
        _valueType: 'NUMBER',
      },
    ],
    logic: '&&',
  }
  const [treeData, setTreeData] = useState(defaultData)

  return (
    <div className="App">
      <Tree
        defaultData={treeData}
        onchange={(value) => {
          console.log(value)
        }}
      />
    </div>
  )
}
```

## 浏览器兼容性

| Browser | Works? |
| ------- | ------ |
| Chrome  | Yes    |
| Firefox | Yes    |
| Safari  | Yes    |
| IE 11   | Yes    |
