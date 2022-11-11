import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import moment from 'moment'
import 'moment/locale/zh-cn'
import 'antd/dist/antd.css';

moment.locale('zh-cn')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

