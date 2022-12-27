import React, { useRef, useState } from 'react'
import { Select, Tag, Popconfirm } from 'antd'
import { ExclamationCircleFilled, PlusCircleOutlined, CaretLeftOutlined, CopyOutlined, DeleteOutlined, PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons'
import './TreeItem.css'
import { useDrop, useDrag } from 'ahooks'

import { DEFAULT_ITEM_DATA, getSummary } from './Item'

const { Option } = Select

/**
 * 根据data 和 position 计算item 的数据
 * 因为希望尽量减少json 的冗余信息，可以直接submit，又希望方便查询父节点信息，所以没有改造成双向链表
 * @param {json} data
 * @param {array} dataPosition
 * @returns
 */
function getItemDataByPosition(data, dataPosition) {
  let itemData = data
  let itemParent = null
  const itemIndex = dataPosition.slice(-1)[0] || null
  dataPosition.forEach((position) => {
    // console.log('forEach: ', position);
    itemParent = itemData
    itemData = itemData.children[position] || {}
  })
  return {
    itemData,
    itemParent,
    itemIndex,
  }
}

/**
 * 增加item 的按钮，release item 的载体
 * @param {object} props
 * @returns
 */
const Toolbar = (props) => {
  const { add, drop, isDroppable } = props
  const [isHovering, setIsHovering] = useState(false)

  const dropRef = useRef(null)

  useDrop(dropRef, {
    onDom: (content) => {
      setIsHovering(false)
      drop()
    },
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
  })

  return (
    <div className={['toolbar', isHovering && 'hover', isDroppable && 'droppable'].join(' ')} ref={dropRef} onClick={add}>
      <PlusCircleOutlined style={{ color: '#1890ff' }} />
    </div>
  )
}
/**
 * 关联多个item 的container
 * @param {object} props
 * @returns
 */
const BranchItem = (props) => {
  const { data, dropData, dataPosition, update, updateDrop, isHovering, add, drop, isDroppable, item, disabled } = props
  let itemData = data
  let itemParent = data
  dataPosition.forEach((position) => {
    itemParent = itemData
    itemData = itemData.children[position]
  })
  const changeLogic = (value) => {
    itemData.logic = value
    update(data)
  }
  return (
    <div className={['item', isHovering && 'hover'].join(' ')}>
      <div className="head">
        <Select disabled={disabled} defaultValue={itemData.logic} onChange={changeLogic}>
          <Option value={'&&'}>而且</Option>
          <Option value={'||'}>或者</Option>
        </Select>
        <CaretLeftOutlined style={{ color: '#eee' }} />
        <div className="brackets"></div>
      </div>
      <div className="children">
        {/* TODO: 这里需要实现数组shift 效果，顺便解决初始化0 item 的时候无法新建item 的问题 */}
        {/* <Toolbar add={add} title={'往前加'} drop={drop} isDroppable={isDroppable}  /> */}
        {itemData?.children?.map((child, childIndex) => {
          const itemDataPosition = dataPosition.concat(childIndex)
          return <TreeItem key={itemDataPosition.join('-')} data={data} dropData={dropData} dataPosition={itemDataPosition} update={update} updateDrop={updateDrop} item={item} disabled={disabled} />
        })}
      </div>
    </div>
  )
}

/**
 * 包含具体节点内容的容器
 * 剩下最后一个的时候，不提供删除按钮
 * @param {object} props
 * @returns
 */
const ItemContainer = (props) => {
  const { data, dataPosition = [], update, newGroup, deleteItem, isHovering, item: Item, disabled } = props
  const onMouseDown = (ev) => ev.stopPropagation()

  let itemData = data
  let itemParent = data
  dataPosition.forEach((position) => {
    itemParent = itemData
    itemData = itemData.children[position]
  })
  const isLastChild = itemParent?.children.length <= 1
  const isShowDeleteBtn = !disabled && (dataPosition.length > 1 || !isLastChild)

  return (
    <div className={['container-row', isHovering && 'hover'].join(' ')} onMouseDown={onMouseDown}>
      <div className="container">
        {/* <span>{itemData.value}</span> */}
        <Item data={data} item={Item} update={update} dataPosition={dataPosition} isEditable={!disabled} />
      </div>
      {!disabled && <CopyOutlined onClick={newGroup} style={{ padding: 10 }} />}
      {isShowDeleteBtn && (
        <Popconfirm key="delete" title="确认要删除吗？" onConfirm={deleteItem} icon={<ExclamationCircleFilled style={{ color: 'red' }} />}>
          <DeleteOutlined style={{ padding: 10 }} />
        </Popconfirm>
      )}
    </div>
  )
}

/**
 * 当节点被折叠后，出现的提示（间接）语
 * @param {object} props
 * @returns
 */
const Tooltip = (props) => {
  return <div className="tooltip">{props.children}</div>
}
const BRACKETS_COLOR = ['transparent', 'magenta', 'gold', 'red', 'volcano', 'orange', 'lime', 'green', 'cyan', 'purple']

/**
 * 根据深度和优先级，输出合理颜色的括号和节点内容
 */
function getTooltip(data, dataPosition, deep = 0) {
  const { itemData } = getItemDataByPosition(data, dataPosition)
  return () => {
    if (Array.isArray(itemData.children) && itemData.children.length > 0) {
      const bracketsStyle = { color: deep ? BRACKETS_COLOR[dataPosition.length] : BRACKETS_COLOR[0] || 'blue' }
      if (bracketsStyle.color === BRACKETS_COLOR[0]) {
        bracketsStyle.display = 'none'
      }
      return (
        <>
          <span style={bracketsStyle}>（</span>
          {itemData.children.map((_, childIndex) => {
            const _dataPosition = dataPosition.concat(childIndex)
            const Child = getTooltip(data, _dataPosition, deep + 1)
            const color = itemData.logic === '&&' ? 'blue' : 'orange'
            const text = itemData.logic === '&&' ? '而且' : '或者'
            // console.log('itemData.value: ', itemData.value);
            return (
              <>
                {childIndex !== 0 && (
                  <Tag color={color} style={{ marginLeft: '8px' }}>
                    {text}
                  </Tag>
                )}
                <Child key={_._key} />
              </>
            )
          })}
          <span style={bracketsStyle}>）</span>
        </>
      )
    }
    return <span>{getSummary(itemData)}</span>
  }
}

/**
 * 整合了以上组件和方法的树图节点主组件
 * 可递归使用，支持拖拽，新增，编辑，删除
 * @param {props} props
 * @returns React.node
 */
const TreeItem = (props) => {
  const { data, dropData, dataPosition = [], update, updateDrop, item, disabled } = props

  const dragRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  useDrag(data, dragRef, {
    onDragStart: (ev) => {
      ev.stopPropagation()
      console.log('onDragStart: ')
      setDragging(true)
      updateDrop({ ...dropData, dataPosition: dataPosition })
    },
    onDragEnd: (ev) => {
      ev.stopPropagation()
      console.log('onDragEnd: ')
      setDragging(false)
      updateDrop({ ...dropData, dataPosition: [] })
    },
  })

  // const ref = useRef(null);
  const isRoot = dataPosition.length === 0
  const isEmpty = isRoot && (!Array.isArray(data?.children) || data?.children.length == 0)

  const isDraggable = !isRoot
  const isDroppable = dataPosition.join('-').indexOf(dropData.dataPosition.join('-')) !== 0
  let isHovering = !dragging && dataPosition.join('-') === dropData.hoverPosition?.join('-')

  const { itemData, itemParent, itemIndex } = getItemDataByPosition(data, dataPosition)
  // console.log('getItemDataByPosition: ', itemData, itemParent, itemIndex);

  const isExpandDefaultTrue = itemData.isExpand === undefined // FIXME: 初始化的时候摘要状态会出现取值问题,所以暂时写死默认都展开
  const isExpand = itemData.isExpand || !itemData.children?.length > 0 || isExpandDefaultTrue
  const TooltipText = getTooltip(data, dataPosition)

  let ItemWrapper = ItemContainer
  if (!isEmpty && (isRoot || (Array.isArray(itemData?.children) && itemData?.children.length > 0))) {
    // console.log(itemData);
    ItemWrapper = BranchItem
  }

  // 处理拖拽
  const drop = (pos) => {
    if (dropData.dataPosition.length === 0) return

    const { itemData: dropItemData, itemParent: dropItemParent, itemIndex: dropItemIndex } = getItemDataByPosition(data, dropData.dataPosition)
    // console.log('test drop: ', pos, itemData, itemIndex, dataPosition, itemParent===dropItemParent);

    // 根据拖拽的源点和目标点，计算tree children 的新数组顺序
    if (itemParent === dropItemParent) {
      const dir = itemIndex + pos > dropItemIndex ? -1 : 0
      itemParent.children.splice(dropItemIndex, 1)
      itemParent.children.splice(itemIndex + pos + dir, 0, dropItemData)
    } else {
      console.log('deleteItem: ', dropItemParent, dropData.dataPosition, dropItemIndex)
      // deleteItem(dropItemParent, dropItemIndex)
      dropItemParent.children.splice(dropItemIndex, 1)
      if (dropItemParent.children.length === 1) {
        Object.assign(dropItemParent, dropItemParent.children[0], { logic: '' })
      }
      itemParent.children.splice(itemIndex + pos, 0, dropItemData)
    }
    update({ ...data })
  }
  const add = (pos) => {
    // console.log('add: ', data.children.length);
    itemParent.children.splice(itemIndex + pos, 0, { ...DEFAULT_ITEM_DATA, _key: generateKey() })
    update({ ...data })
  }

  /**
   * 剩下一个节点的情况，删掉多余逻辑容器
   * 但根顶点至少包含一个逻辑容器
   */
  const deleteItem = () => {
    console.log('delete: ', itemParent, itemIndex)
    itemParent.children.splice(itemIndex, 1)
    let _itemParent = itemParent
    // let _dataPosition = a_dataPosition
    if (_itemParent.children?.length === 1 && dataPosition.length > 1) {
      // if(itemParent.children.length === 1){
      // }
      Object.assign(_itemParent, _itemParent.children[0], { logic: '' })
      // _dataPosition = _dataPosition.slice(0,-1)
      // _itemParent = getItemDataByPosition(data, _dataPosition)
    }
    update({ ...data })
  }
  const newGroup = () => {
    itemData.logic = ''
    const _itemData = {
      // TODO: 根据产品需求改写
      logic: '&&',
      isExpand: true,
      children: [itemData, { ...DEFAULT_ITEM_DATA, _key: generateKey() }],
    }
    if (itemParent) {
      itemParent.children.splice(itemIndex, 1, _itemData)
      update({ ...data })
    } else {
      update({ ..._itemData })
    }
  }
  const updateExpand = (ev, expand) => {
    ev.stopPropagation()
    // console.log('updateExpand: ', expand);
    itemData.isExpand = expand
    update({ ...data })
  }
  const addBefore = () => add(0)
  const addAfter = () => add(1)
  const dropBefore = () => drop(0)
  const dropAfter = () => drop(1)
  const openExpand = (ev) => updateExpand(ev, true)
  const closeExpand = (ev) => updateExpand(ev, false)

  // 实现鼠标移入高亮。直接只用:hover 会导致一直全局高亮。
  const onMouseEnter = (ev) => {
    // console.log('onMouseEnter: ', ev.target);
    ev.stopPropagation()
    updateDrop({ ...dropData, hoverPosition: dataPosition })
  }
  const onMouseLeave = (ev) => {
    // console.log('onMouseLeave: ', ev.target);
    updateDrop({ ...dropData, hoverPosition: null })
  }
  return (
    <div ref={disabled ? null : dragRef} className={['drop-item', dragging && 'grab'].join(' ')} onMouseOver={onMouseEnter} onMouseLeave={onMouseLeave}>
      {!disabled && !isRoot && !isEmpty && [0, undefined, null].includes(itemIndex) && <Toolbar add={addBefore} title={'往前加'} drop={dropBefore} isDroppable={isDroppable} />}
      <div className={['drop-main', isHovering && 'hover', !disabled && isDraggable && 'grab'].join(' ')}>
        <div className="expand-icon">{ItemWrapper === BranchItem && <>{isExpand ? <MinusSquareOutlined onMouseDown={closeExpand} /> : <PlusSquareOutlined onMouseDown={openExpand} />}</>}</div>

        {isExpand && (
          <>
            <ItemWrapper
              data={data}
              dropData={dropData}
              dataPosition={dataPosition}
              update={update}
              updateDrop={updateDrop}
              newGroup={newGroup}
              deleteItem={deleteItem}
              add={addBefore}
              drop={dropBefore}
              isDroppable={isDroppable}
              item={item}
              disabled={disabled}
            />
          </>
        )}

        {!isExpand && (
          <Tooltip>
            <TooltipText />
          </Tooltip>
        )}
      </div>

      {!disabled && !isEmpty && !isRoot && <Toolbar add={addAfter} title={'往后加'} drop={dropAfter} isDroppable={isDroppable} />}
    </div>
  )
}

export default TreeItem
/**
 * 为tree 节点创建key，避免react 渲染缓存问题
 */
const TREE_KEY_PREFIX = 'TREE_KEY_PREFIX-'
let _key = 0
export function generateKey() {
  const res = TREE_KEY_PREFIX + _key++
  return res
}
/**
 * TODO:
 * [x]chrildren 只有一个,,,连续多层chrildren 变成一个
 * [x]折叠
 * [x]计算tooltip
 * [ ]取反
 * [ ]删掉整个item
 * [x]离开tree
 * [x]从一到中间，错误到了第三
 * [x]子元素显示禁止拖拽
 * [ ]拖拽引发删除问题
 */
