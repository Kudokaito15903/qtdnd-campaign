import { useState, useEffect } from 'react'
import { Users, Send, CheckCircle, FileText } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    campaigns: 0,
    templates: 0,
    sentEmails: 0
  })

  useEffect(() => {
    // Demo stats (fetch from real API later)
    setStats({
      customers: 1,
      campaigns: 1,
      templates: 1,
      sentEmails: 1
    })
  }, [])

  return (
    <div>
      <h1>Tổng Quan</h1>
      <p className="subtitle">Thống kê hiệu suất chiến dịch email của quỹ tín dụng</p>

      <div className="stat-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon"><Send size={24} /></div>
          <div className="stat-title">Tổng Chiến Dịch</div>
          <div className="stat-value">{stats.campaigns}</div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-title">Email Đã Gửi</div>
          <div className="stat-value">{stats.sentEmails}</div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-title">Khách Hàng</div>
          <div className="stat-value">{stats.customers}</div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon"><FileText size={24} /></div>
          <div className="stat-title">Mẫu Email</div>
          <div className="stat-value">{stats.templates}</div>
        </div>
      </div>
    </div>
  )
}
