import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Send, LogOut } from 'lucide-react'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Templates from './pages/Templates'
import Campaigns from './pages/Campaigns'
import Login from './pages/Login'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar glass-panel">
          <div className="sidebar-logo">
            <img src="/logo-quy-tin-dung-nhan-dan.webp" alt="Logo QTDND" style={{ width: '42px', height: 'auto', objectFit: 'contain' }} />
            QTDND<span>Nam Hà</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '16px', paddingLeft: '54px' }}>
            Chi nhánh Thái Bình
          </div>
          
          <nav className="nav-links" style={{ flex: 1 }}>
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <LayoutDashboard size={20} />
              Tổng Quan
            </NavLink>
            <NavLink to="/campaigns" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Send size={20} />
              Chiến Dịch
            </NavLink>
            <NavLink to="/templates" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <FileText size={20} />
              Mẫu Email
            </NavLink>
            <NavLink to="/customers" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              <Users size={20} />
              Khách Hàng
            </NavLink>
          </nav>

          <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-color)' }}>
            <button 
              onClick={handleLogout}
              className="nav-link" 
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)', padding: 0 }}
            >
              <LogOut size={20} />
              Đăng Xuất
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/customers" element={<Customers />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
