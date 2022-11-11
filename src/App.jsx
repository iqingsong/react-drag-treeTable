import React from 'react'
import Tree from './components/DynamicTree/Tree'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN';


function App() {
  return (
    <div className="App">
      <ConfigProvider locale={zhCN}>
        <Tree />
      </ConfigProvider>
    </div>
  );
}

export default App;
