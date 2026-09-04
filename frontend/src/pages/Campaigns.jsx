import { useState, useEffect } from 'react'
import { Plus, Play, Clock, X, Trash2 } from 'lucide-react'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', templateId: '', scheduledAt: '' })

  const fetchCampaigns = () => {
    setIsLoading(true)
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data))
      .catch(err => console.error(err))
      .finally(() => {
        setIsLoading(false)
      })
  }

  const fetchTemplates = () => {
    fetch('/api/campaigns/templates')
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchCampaigns()
    // Không tải Templates ở đây nữa để tránh nặng mạng (4.9MB)
    // Không dùng setInterval nữa để tránh spam API
  }, [])

  const handleOpenModal = () => {
    if (templates.length === 0) {
      fetchTemplates()
    }
    setShowModal(true)
  }

  const startCampaign = (id) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'PROCESSING' } : c))

    fetch(`/api/campaigns/${id}/start`, { method: 'POST' })
      .then(() => fetchCampaigns())
      .catch(err => {
        console.error(err)
        fetchCampaigns() 
      })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chiến dịch "${name}" không? Toàn bộ danh sách gửi liên quan cũng sẽ bị xóa.`)) {
      fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      })
      .then(() => fetchCampaigns())
      .catch(err => console.error(err))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Find the selected template to get its subject and htmlContent
    const selectedTemplate = templates.find(t => t.id === parseInt(formData.templateId))
    if (!selectedTemplate) return

    const isScheduled = formData.scheduledAt !== ''
    
    fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        subject: selectedTemplate.subject,
        htmlContent: selectedTemplate.htmlContent,
        status: isScheduled ? 'SCHEDULED' : 'CREATED',
        scheduledAt: isScheduled ? formData.scheduledAt : null
      })
    })
      .then(() => {
        setShowModal(false)
        setFormData({ name: '', templateId: '', scheduledAt: '' })
        fetchCampaigns()
      })
      .catch(err => console.error(err))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Chiến Dịch</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Quản lý và khởi chạy các chiến dịch gửi email</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button button-secondary" onClick={fetchCampaigns} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Làm mới
          </button>
          <button className="button button-primary" onClick={handleOpenModal}>
            <Plus size={18} />
            Tạo Chiến Dịch
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Chiến Dịch</th>
              <th>Tiêu Đề</th>
              <th>Lịch Gửi</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6">
                  <div className="spinner-container">
                    <div className="spinner"></div>
                  </div>
                </td>
              </tr>
            ) : (
              campaigns.map(c => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                <td>{c.name}</td>
                <td>{c.subject}</td>
                <td>
                  {c.scheduledAt ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <Clock size={14} /> 
                      {new Date(c.scheduledAt).toLocaleString('vi-VN')}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>Gửi ngay</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${
                    c.status === 'COMPLETED' ? 'badge-success' : 
                    c.status === 'PROCESSING' ? 'badge-info' : 
                    c.status === 'SCHEDULED' ? 'badge-warning' :
                    c.status === 'FAILED' ? 'badge-danger' :
                    'badge-warning'
                  }`} style={c.status === 'SCHEDULED' ? { backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', borderColor: 'rgba(168, 85, 247, 0.3)' } : {}}>
                    {c.status === 'COMPLETED' ? 'Đã Xong' : 
                     c.status === 'PROCESSING' ? 'Đang Gửi' : 
                     c.status === 'SCHEDULED' ? 'Đã Lên Lịch' : 
                     c.status === 'FAILED' ? 'Có Lỗi' : 'Mới Tạo'}
                  </span>
                </td>
                <td>
                  {c.status === 'CREATED' && (
                    <button 
                      className="button button-primary" 
                      style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }}
                      onClick={() => startCampaign(c.id)}
                    >
                      <Play size={14} /> Bắt Đầu
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(c.id, c.name)}
                    title="Xóa chiến dịch"
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: 'var(--danger-color)', padding: '4px', opacity: 0.7, transition: '0.2s' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )))}
            {!isLoading && campaigns.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Không tìm thấy chiến dịch nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Tạo Chiến Dịch Mới</h2>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên Chiến Dịch</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Vd: Khuyến mãi Tết 2026"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chọn Mẫu Email (Template)</label>
                <select 
                  className="form-input" 
                  required 
                  value={formData.templateId} 
                  onChange={e => setFormData({...formData, templateId: e.target.value})}
                >
                  <option value="" disabled>-- Chọn một mẫu --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Tiêu đề: {t.subject})</option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p style={{ color: 'var(--warning-color)', fontSize: '12px', marginTop: '8px' }}>
                    * Bạn chưa có mẫu email nào. Hãy sang trang Mẫu Email để tạo trước.
                  </p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Hẹn giờ gửi (Không bắt buộc)</label>
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  value={formData.scheduledAt} 
                  onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                />
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>
                  Nếu bỏ trống, chiến dịch sẽ cần bạn bấm "Bắt Đầu" thủ công.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="button button-primary" disabled={templates.length === 0}>Tạo Chiến Dịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
