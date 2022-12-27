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

export default App
