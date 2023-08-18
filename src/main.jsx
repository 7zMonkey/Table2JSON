import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {  ConfigProvider } from 'antd';

import './index.css'
import 'antd/dist/reset.css'
import zhCN from 'antd/locale/zh_CN';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={zhCN}>
      <React.StrictMode>
      <App />
    </React.StrictMode>
  </ConfigProvider>

)
