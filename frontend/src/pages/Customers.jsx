import { useState, useEffect, useRef } from 'react'
import { Plus, Users, Upload, X, Trash2, Pencil } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', marketingConsent: true })
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchCustomers = () => {
    setIsLoading(true)
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `/api/customers/${editingId}` : '/api/customers'
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEditing ? formData : { ...formData, marketingConsent: true, unsubscribed: false })
    })
      .then(() => {
        closeModal()
        fetchCustomers()
      })
      .catch(err => console.error(err))
  }

  const openEditModal = (c) => {
    setFormData({ name: c.name, email: c.email, marketingConsent: c.marketingConsent })
    setEditingId(c.id)
    setIsEditing(true)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEditing(false)
    setEditingId(null)
    setFormData({ name: '', email: '', phone: '', marketingConsent: true })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}" không?`)) {
      fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })
      .then(() => fetchCustomers())
      .catch(err => console.error(err))
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) // Read as array of arrays
        
        // Find columns for Name and Email based on the first row (headers)
        const headers = data[0].map(h => String(h).toLowerCase().trim())
        let nameIndex = headers.findIndex(h => h.includes('tên') || h.includes('name'))
        let emailIndex = headers.findIndex(h => h.includes('email'))
        
        // Fallback to columns 0 and 1 if not found
        if (nameIndex === -1) nameIndex = 0
        if (emailIndex === -1) emailIndex = 1

        const bulkCustomers = []
        for (let i = 1; i < data.length; i++) {
          const row = data[i]
          if (!row || row.length === 0) continue
          
          const name = row[nameIndex]
          const email = row[emailIndex]
          
          if (name && email) {
            bulkCustomers.push({
              name: String(name).trim(),
              email: String(email).trim(),
              marketingConsent: true,
              unsubscribed: false
            })
          }
        }

        if (bulkCustomers.length > 0) {
          fetch('/api/customers/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bulkCustomers)
          })
            .then(res => {
              if (res.ok) {
                alert(`Đã nạp thành công ${bulkCustomers.length} khách hàng!`)
                fetchCustomers()
              } else {
                alert('Lỗi khi nạp dữ liệu khách hàng lên máy chủ.')
              }
            })
            .catch(err => {
              console.error(err)
              alert('Lỗi hệ thống khi tải lên.')
            })
            .finally(() => {
              setIsUploading(false)
              if (fileInputRef.current) fileInputRef.current.value = ''
            })
        } else {
          alert('Không tìm thấy dữ liệu hợp lệ trong file Excel. Vui lòng kiểm tra lại cột Tên và Email.')
          setIsUploading(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error("Lỗi đọc file:", error)
        alert('File không hợp lệ hoặc bị lỗi.')
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Khách Hàng</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Quản lý danh sách thành viên của Quỹ tín dụng</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a 
            href="/Mau_Danh_Sach_Khach_Hang.xlsx" 
            download 
            className="button button-secondary"
            style={{ display: 'flex', gap: '8px', alignItems: 'center', textDecoration: 'none' }}
          >
            Tải File Mẫu
          </a>

          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            className="button button-secondary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Upload size={18} />
            {isUploading ? 'Đang xử lý...' : 'Nhập từ Excel'}
          </button>
          
          <button className="button button-primary" onClick={() => { setIsEditing(false); setShowModal(true) }}>
            <Plus size={18} />
            Thêm Khách Hàng
          </button>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ Tên</th>
              <th>Email</th>
              <th>Đăng Ký Quảng Cáo</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
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
              customers.map(c => (
                <tr key={c.id}>
                  <td>#{c.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      background: 'var(--accent-primary)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                      color: '#fff'
                    }}>
                      {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {c.name}
                  </div>
                </td>
                <td>{c.email}</td>
                <td>
                  <span className={`badge ${c.marketingConsent ? 'badge-success' : 'badge-warning'}`}>
                    {c.marketingConsent ? 'Đã đăng ký' : 'Không'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${!c.unsubscribed ? 'badge-success' : 'badge-danger'}`}>
                    {!c.unsubscribed ? 'Đang theo dõi' : 'Đã hủy đăng ký'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    onClick={() => openEditModal(c)}
                    title="Sửa khách hàng"
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: 'var(--accent-primary)', padding: '4px', opacity: 0.7, transition: '0.2s',
                      marginRight: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id, c.name)}
                    title="Xóa khách hàng"
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
            {!isLoading && customers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Không tìm thấy khách hàng nào.
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
              <h2 className="modal-title" style={{ margin: 0 }}>{isEditing ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng'}</h2>
              <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Họ Tên</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Vd: Nguyễn Văn A"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="Vd: nguyen.van.a@example.com"
                />
              </div>
              {isEditing && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formData.marketingConsent}
                      onChange={e => setFormData({...formData, marketingConsent: e.target.checked})}
                    />
                    Đồng ý nhận quảng cáo
                  </label>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="button button-primary">{isEditing ? 'Cập Nhật' : 'Lưu Khách Hàng'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
