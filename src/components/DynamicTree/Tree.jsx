import React, { useRef, useState } from 'react'
import './Tree.css'
import { Typography, Divider } from 'antd'
import Item, { DEFAULT_ITEM_ROOT_DATA } from './Item'
import TreeItem, { generateKey } from './TreeItem'
import { useEffect } from 'react'

const { Paragraph } = Typography

const DEFAULT_DROPDATA = {
  dataPosition: [],
  hoverPosition: [],
}
const Tree = (props) => {
  const { defaultData = DEFAULT_ITEM_ROOT_DATA, disabled } = props
  const ref = useRef(null)
  // const mouse = useMouse(ref.current)
  const [treeData, setTreeData] = useState(defaultData)
  const [dropData, setDropData] = useState(DEFAULT_DROPDATA)

  useEffect(() => {
    setTreeData(formatKey(defaultData))
  }, [defaultData])

  const update = (data) => {
    setTreeData(data)
  }

  const onMouseUp = () => {
    setDropData(DEFAULT_DROPDATA)
  }
  const updateDrop = (data) => {
    // console.log('updateDrop: ', data)
    setDropData(data)
  }

  return (
    <>
      <Paragraph>
        <p>参考了“阿里宜搭” 的概念，使用树的样式代替原来表格的样式。</p>
        <ol>
          <li>增加拖拽功能。简化修改步骤。</li>
          <li>增加折叠功能。方便聚焦关注点。</li>
          <li>增加简介功能。结合折叠功能，将复杂逻辑化繁为简。简单逻辑一目了然。</li>
          <li>使用括号样式，代替“括号复选框”，更好表达同级的逻辑关系。</li>
          <li>一键新建分组逻辑，减少操作步骤。</li>
          <li>增加新逻辑的按钮从尾部改到实际增加的位置，减小误操作。</li>
          <li>整体内容更加紧凑，减少空间浪费和关注点飘移。</li>
        </ol>
      </Paragraph>
      <Divider />
      <div className="tree" ref={ref} onMouseUp={onMouseUp}>
        <TreeItem data={treeData} dropData={dropData} disabled={disabled} update={update} updateDrop={updateDrop} item={Item} />
      </div>
    </>
  )
}

/**
 * 为tree data 数据增加_key，避免react 渲染问题
 */
function formatKey(data) {
  const dataWithKey = { ...data }
  function _transform(_data) {
    const _key = generateKey()
    console.log('formatKey _key: ', _key)
    _data._key = _key
    if (Array.isArray(_data.children) && _data.children.length > 0) {
      _data.children.forEach((v) => _transform(v))
    }
  }
  _transform(dataWithKey)
  return dataWithKey
}

export default Tree
