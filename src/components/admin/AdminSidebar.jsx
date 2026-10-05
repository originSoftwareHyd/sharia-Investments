import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Mail, LogOut, Menu, X } from 'lucide-react'
import { adminAuth } from '../../hooks/useAdminAuth'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts',     label: 'Posts',     icon: FileText },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
]

function NavContent({ unreadCount, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    adminAuth.logout()
    navigate('/admin/login')
  }

  return (
    <>
      <div className="admin-sidebar__brand">
        <div>
          <span className="admin-sidebar__brand-name">Shariah Investments</span>
          <span className="admin-sidebar__brand-sub">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="admin-sidebar__close" aria-label="Close menu">
            <X size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href || location.pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              to={href}
              onClick={onClose}
              className={`admin-nav-item ${active ? 'admin-nav-item--active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{label}</span>
              {label === 'Enquiries' && unreadCount > 0 && (
                <span className="admin-nav-badge">{unreadCount}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar__footer">
        <button onClick={handleLogout} className="admin-nav-item admin-nav-item--logout">
          <LogOut size={16} strokeWidth={1.75} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  )
}

export function AdminSidebar({ unreadCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside className="admin-sidebar admin-sidebar--desktop">
        <NavContent unreadCount={unreadCount} />
      </aside>

      {/* Mobile toggle */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="admin-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`admin-sidebar admin-sidebar--mobile ${mobileOpen ? 'admin-sidebar--open' : ''}`}>
        <NavContent unreadCount={unreadCount} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
