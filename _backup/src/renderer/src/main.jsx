// import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Suppress Ant Design React 19 compatibility warning
const originalWarn = console.warn
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('[antd: compatible]')) {
    return // Suppress this specific warning
  }
  originalWarn.apply(console, args)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
