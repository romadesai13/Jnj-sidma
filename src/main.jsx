import React from 'react'
import ReactDOM from 'react-dom/client'
import AppFlow from './AppFlow'
import './index.css'
import "./styles.css";
import LayoutFlow from './ElkExample';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <AppFlow />
     {/* <LayoutFlow /> */}
  </React.StrictMode>,
)
