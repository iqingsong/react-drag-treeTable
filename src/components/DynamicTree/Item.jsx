import React, { useEffect, useRef, useState } from 'react'
import { Select, Input, DatePicker } from 'antd'
import moment from 'moment'

import styles from './Item.module.less'
const { Option } = Select

export const BOUNDARY = '&'
// export const ENUM_TYPE_KEY = 'enum_set'
// export const DATA_PATH_KEY = 'data_path'

const OPERATORS = {
  'length less than': '长度小于',
  'reg match': '正则匹配',
  in: '被包含于',
  'equal or greater than': '大于等于',
  'less than': '小于',
  equal: '等于',
  contains: '包含',
  'equal or less than': '小于等于',
  'not equal': '不等于',
  'length greater than': '长度大于',
  between: '之间',
  'greater than': '大于',
  'is not null': '不为空',
  'is null': '为空',
}

const TYPEOPTIONS = { STRING: '字符串', NUMBER: '数值', DATE: '日期', ARRAY: '数组' }

export const PATH_OPERATOR_MAP = {
  'length less than': { left: ['STRING'], right: ['NUMBER'] },
  'reg match': { left: ['STRING', 'NUMBER'], right: ['STRING'] },
  in: { left: ['STRING', 'NUMBER'], right: ['STRING'] },
  'equal or greater than': { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  'call service': { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING'] },
  'less than': { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  equal: { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  contains: { left: [], right: ['STRING'] },
  'equal or less than': { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  'not equal': { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  'is not null': { left: ['STRING', 'NUMBER', 'DATE'], right: [] },
  'length greater than': { left: ['STRING'], right: ['NUMBER'] },
  between: { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  'greater than': { left: ['STRING', 'NUMBER', 'DATE'], right: ['STRING', 'NUMBER', 'DATE'] },
  'is null': { left: ['STRING', 'NUMBER', 'DATE'], right: [] },
}

function useOperatorsOptions() {
  const [paramOptions, setParamOptions] = useState([])

  useEffect(() => {
    let keysArray = Object.keys(OPERATORS)
    for (const key in keysArray) {
      const element = { title: OPERATORS[keysArray[key]], value: keysArray[key] }
      paramOptions.push(element)
    }
    // console.log(paramOptions);
    setParamOptions([...paramOptions])
  }, [])
  return {
    paramOptions,
  }
}

/**
 * @param {*} props
 * @returns
 */
const Item = (props) => {
  const { data, update, dataPosition, isEditable = true } = props
  let itemData = data
  let itemParent = data
  // let isInited = useRef(false)

  const { paramOptions } = useOperatorsOptions()
  let [paramTypes, setParamTypes] = useState([])
  dataPosition.forEach((position) => {
    itemParent = itemData
    itemData = itemData.children[position]
  })
  
  useEffect(() => {
    let _paramTypes = []
    if (itemData.operator === '' || typeof itemData.operator === 'undefined') return
    console.log(PATH_OPERATOR_MAP[itemData.operator], 'operator', itemData.operator)
    PATH_OPERATOR_MAP[itemData.operator].right.forEach((el) => {
      _paramTypes.push({
        title: TYPEOPTIONS[el],
        value: el,
      })
    })
    console.log(_paramTypes)
    setParamTypes(_paramTypes)
  }, [itemData.operator])

  // 初始化，根据最新的模型树数据，更新可用操作符，回显操作符和参数
  useEffect(() => {}, [itemData._value])

  // 修改操作符（校验规则）
  function changeRuleWithCleanParams(operator) {
    if (itemData.operator === operator) return
    itemData.operator = operator
    // 校验规则改变后，参数下拉选项也改变了，需要清空参数下拉选项
    itemData.valueMethod = ''
    itemData.valueType = ''
    itemData._valueType = ''
    itemData.value = ''
    // itemData._value = ''
    update({ ...data })
  }

  // 右值 type
  const onChangevalueType = (val) => {
    itemData.valueType = val
    itemData._valueType = itemData.valueType
    if (val === 'DATE') {
      itemData.value = new moment().format('YYYY-MM-DD HH:mm:ss')
      itemData._value = itemData.value
    } else {
      itemData.value = ''
      itemData._value = itemData.value
    }
    update({ ...data })
  }
  // 右值 value
  const changeInputValue = async (value, titles) => {
    // console.log('changeInputValue: ', value)
    itemData.value = value
    itemData._value = itemData.value
    update({ ...data })
  }

  // const isShowRight = !itemData?.operator?.includes('null') // 校验符是“为空”或者“不为空”是，不显示右值
  // const _itemKey = [itemData.leftValue, itemData.operator].concat(dataPosition).join('-')
  const _itemKey = itemData._key
  return (
    <>
      {/* TODO: 以后在TreeItem 为Item 生成id 做key，减少react 创建dom  */}
      <div key={_itemKey} className={styles.item}>

        <Select onChange={changeRuleWithCleanParams} defaultValue={itemData?.operator} disabled={!isEditable} placeholder="请选择" style={{ width: 100 }}>
          {paramOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.title}
            </Option>
          )
          )}
        </Select>

        {/* 类型 */}
        <Select onChange={onChangevalueType} defaultValue={itemData?.valueType} disabled={!isEditable} placeholder="请选择" style={{ width: 100 }}>
          {paramTypes.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.title}
            </Option>
          ))}
        </Select>

        {/* 字符串、数值 */}

        {[Object.keys(TYPEOPTIONS)[0], Object.keys(TYPEOPTIONS)[1], '', undefined, null].includes(itemData._valueType) &&
            <Input disabled={!isEditable} style={{ width: 120 }} type={itemData?.valueType ===  Object.keys(TYPEOPTIONS)[1] ?  Object.keys(TYPEOPTIONS)[1] : ''}
          placeholder='请输入' defaultValue={itemData?.value} onChange={(ev) => { changeInputValue(ev.target.value) }} />}

        {/* 日期 */}
        {itemData._valueType === Object.keys(TYPEOPTIONS)[2] &&
            <DatePicker disabled={!isEditable} showTime style={{ width: 120, }} value={moment(itemData.value)}
                onChange={changeInputValue} />}

        {!isEditable && <Input disabled value={getValue(itemData.value)} style={{ width: 80 }} />}
      </div>
    </>
  )
}

function getValue(value) {
  return value?.split(BOUNDARY)[1] || value || '（未填写）'
}

/**
 * 获取摘要信息
 * @param {*} data
 * @returns
 */
export function getSummary(data) {
  const value = getValue(data._value || data.value)
  const operator = OPERATORS[data?.operator] || '（未填写）'
  let res = operator
  if (!data?.operator.includes('null')) {
    res += ' ' + value
  }
  return res
}

export const DEFAULT_ITEM_ROOT_DATA = {
  isExpand: false,
  children: [
    {
      isExpand: false,
      value: '',
      valueMethod: '',
      operator: '',
      valueType: '',
      children: [],
      // operator: 'length less than',
      // value: '123',
      // valueMethod: '',
      // valueType: 'NUMBER',
      // _value: '123',
      // _valueType: 'NUMBER',
    },
  ],
  logic: '&&',
}
export const DEFAULT_ITEM_DATA = {
  isExpand: false,
  value: '',
  valueMethod: '',
  operator: '',
  valueType: '',
  logic: '',
  children: [],
}

export default Item
