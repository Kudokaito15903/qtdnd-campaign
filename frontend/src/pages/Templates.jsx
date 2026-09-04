import { useState, useEffect, useRef, useMemo } from 'react'
import { Plus, LayoutTemplate, X, Trash2, Pencil } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', subject: '', htmlContent: '' })
  const quillRef = useRef(null)

  const imageHandler = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (file) {
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData
          })
          const data = await res.json()
          if (data.url) {
            const quill = quillRef.current.getEditor()
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, 'image', data.url)
          } else {
            alert('Lỗi upload ảnh: ' + (data.error || 'Unknown error'))
          }
        } catch (err) {
          console.error(err)
          alert('Không thể upload ảnh, vui lòng thử lại!')
        }
      }
    }
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [])

  const fetchTemplates = () => {
    setIsLoading(true)
    fetch('/api/campaigns/templates')
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `/api/campaigns/templates/${editingId}` : '/api/campaigns/templates'
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(() => {
        closeModal()
        fetchTemplates()
      })
      .catch(err => console.error(err))
  }

  const openEditModal = (t) => {
    setIsEditing(true)
    setShowModal(true)
    
    // Khi nhấn Sửa, gọi API để lấy htmlContent trọn vẹn
    fetch(`/api/campaigns/templates/${t.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({ name: data.name, subject: data.subject, htmlContent: data.htmlContent })
        setEditingId(data.id)
      })
      .catch(err => console.error(err))
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEditing(false)
    setEditingId(null)
    setFormData({ name: '', subject: '', htmlContent: '' })
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mẫu email "${name}" không?`)) {
      fetch(`/api/campaigns/templates/${id}`, {
        method: 'DELETE'
      })
      .then(() => fetchTemplates())
      .catch(err => console.error(err))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Mẫu Email</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Thiết kế nội dung email gửi cho khách hàng</p>
        </div>
        <button className="button button-primary" onClick={() => { setIsEditing(false); setShowModal(true) }}>
          <Plus size={18} />
          Tạo Mẫu Mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutTemplate size={20} color="var(--accent-primary)" />
              {t.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
              Tiêu đề: {t.subject}
            </p>
            <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', fontSize: '12px', maxHeight: '100px', overflow: 'hidden', flex: 1 }}>
              <div dangerouslySetInnerHTML={{ __html: (t.previewHtml || '') + '...' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => openEditModal(t)}
                className="button button-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent' }}
              >
                <Pencil size={14} color="var(--accent-primary)" /> Sửa
              </button>
              <button 
                onClick={() => handleDelete(t.id, t.name)}
                className="button button-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent' }}
              >
                <Trash2 size={14} color="var(--danger-color)" /> Xóa
              </button>
            </div>
          </div>
        )))}
        {!isLoading && templates.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Chưa có mẫu email nào. Hãy tạo một mẫu mới.
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>{isEditing ? 'Sửa Mẫu Email' : 'Tạo Mẫu Email Mới'}</h2>
              <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tên mẫu (dùng để quản lý nội bộ)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Vd: Mẫu Giới Thiệu Lãi Suất Mới"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tiêu đề Email (Khách hàng sẽ thấy)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.subject} 
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="Vd: Quỹ Tín Dụng Nam Hà - Thông báo lãi suất tháng 9"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nội dung Email</label>
                <div style={{ background: '#fff', borderRadius: '8px', color: '#000' }}>
                  <ReactQuill 
                    ref={quillRef}
                    theme="snow"
                    value={formData.htmlContent} 
                    onChange={v => setFormData({...formData, htmlContent: v})}
                    modules={modules}
                    style={{ height: '300px', marginBottom: '42px' }}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="button button-primary" disabled={!formData.htmlContent || formData.htmlContent === '<p><br></p>'}>{isEditing ? 'Cập Nhật' : 'Lưu Mẫu Email'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
