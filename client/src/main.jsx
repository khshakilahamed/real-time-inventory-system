import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// In dev this stays empty and requests go through the Vite proxy (vite.config.js).
// In prod, set VITE_API_BASE_URL to the deployed server's URL.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
