import React from 'react'
import ReactDOM from 'react-dom/client'
import AppFlow from './AppFlow'
//import './index.css'
import "./styles.css";
import LayoutFlow from './ElkExample';
import TestFlow from './Test'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     {/* <TestFlow /> */}
     {/* <AppFlow /> */}
      <LayoutFlow />
  </React.StrictMode>,
)
