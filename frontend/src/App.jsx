import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Send, Mail } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Templates from './pages/Templates'
import Campaigns from './pages/Campaigns'
import './index.css'

function App() {
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
          
          <nav className="nav-links">
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
