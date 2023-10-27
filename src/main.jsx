import React from 'react'
import ReactDOM from 'react-dom/client'
import AppFlow from './AppFlow'
import AppFlowELK from './AppFlowELK'
import './index.css'
import "./styles.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppFlowELK />
  </React.StrictMode>,
)
