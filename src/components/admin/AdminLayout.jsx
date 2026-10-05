import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAuth } from '../../hooks/useAdminAuth'
import { AdminSidebar } from './AdminSidebar'
import { enquiryService } from '../../services/enquiryService'

export function AdminLayout({ children }) {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!adminAuth.isAuthenticated()) {
      navigate('/admin/login', { replace: true })
      return
    }
    setUnreadCount(enquiryService.countUnread())
  }, [navigate])

  if (!adminAuth.isAuthenticated()) return null

  return (
    <div className="admin-shell">
      <AdminSidebar unreadCount={unreadCount} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
