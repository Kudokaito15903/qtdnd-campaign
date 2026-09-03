import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ghi đè hàm fetch mặc định để tự động chèn Token vào mọi API
window._originalFetch = window.fetch
window.fetch = async (...args) => {
  let [resource, config] = args
  
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    config = config || {}
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': 'Bearer ' + token
      }
    }
  }

  const response = await window._originalFetch(resource, config)
  
  // Nếu server trả về 401 (Hết hạn hoặc token sai) -> Tự động đăng xuất
  if (response.status === 401 && !resource.includes('/api/auth/login')) {
    localStorage.removeItem('token')
    window.location.reload()
  }
  
  return response
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
