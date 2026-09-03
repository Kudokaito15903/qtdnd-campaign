import { useState } from 'react'
import { Lock } from 'lucide-react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Direct raw fetch to bypass our global interceptor since we don't have token yet
      const fetchFn = window._originalFetch || window.fetch
      const response = await fetchFn('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        onLogin()
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!')
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/logo-quy-tin-dung-nhan-dan.webp" alt="Logo" style={{ width: '80px', height: 'auto' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>QTDND Nam Hà</h2>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Hệ thống Quản lý Chiến dịch
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: 'var(--danger-color)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tài khoản</label>
            <input 
              type="text" 
              className="form-input" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="button button-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner-small spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderLeftColor: '#fff' }}></div>
            ) : (
              <><Lock size={18} /> Đăng Nhập</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
