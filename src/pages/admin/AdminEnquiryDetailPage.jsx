import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { enquiryService } from '../../services/enquiryService'
import { formatDate } from '../../utils/formatDate'

export function AdminEnquiryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [enquiry, setEnquiry] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const found = enquiryService.getById(id)
    if (!found) { setNotFound(true); return }
    // Auto-mark as read on open
    const updated = enquiryService.update(id, { isRead: true })
    setEnquiry(updated)
  }, [id])

  function patch(data) {
    const updated = enquiryService.update(id, data)
    setEnquiry(updated)
  }

  function remove() {
    if (!window.confirm('Delete this enquiry? This cannot be undone.')) return
    enquiryService.delete(id)
    navigate('/admin/enquiries')
  }

  if (notFound) return (
    <AdminLayout>
      <div className="admin-page">
        <p className="admin-empty">Enquiry not found.</p>
      </div>
    </AdminLayout>
  )

  if (!enquiry) return (
    <AdminLayout>
      <div className="admin-page">
        <p className="admin-loading">Loading…</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="admin-page">
        <Link to="/admin/enquiries" className="admin-back-link">
          <ArrowLeft size={14} /> Back to Enquiries
        </Link>

        <div className="admin-detail-card">
          <div className="admin-detail-card__header">
            <div>
              <h1 className="admin-detail-card__subject">{enquiry.subject}</h1>
              <p className="admin-detail-card__from">
                {enquiry.name} ·{' '}
                <a href={`mailto:${enquiry.email}`} className="admin-link">{enquiry.email}</a>
                {enquiry.phone && ` · ${enquiry.phone}`}
              </p>
              <p className="admin-detail-card__date">{formatDate(enquiry.createdAt)}</p>
            </div>
            <span className={`admin-badge ${enquiry.isRead ? 'admin-badge--read' : 'admin-badge--unread'}`}>
              {enquiry.isRead ? 'Read' : 'Unread'}
            </span>
          </div>

          <hr className="admin-divider" />

          <p className="admin-detail-card__message">{enquiry.message}</p>

          <div className="admin-detail-card__footer">
            <button onClick={() => patch({ isRead: !enquiry.isRead })} className="admin-action-btn">
              {enquiry.isRead ? 'Mark as Unread' : 'Mark as Read'}
            </button>
            <button onClick={() => patch({ isArchived: !enquiry.isArchived })} className="admin-action-btn">
              {enquiry.isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button onClick={remove} className="admin-action-btn admin-action-btn--danger">
              Delete
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
