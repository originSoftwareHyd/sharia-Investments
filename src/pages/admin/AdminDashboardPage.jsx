import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { articleService } from '../../services/articleService'
import { enquiryService } from '../../services/enquiryService'
import { formatDate } from '../../utils/formatDate'

function StatCard({ label, value, highlight }) {
  return (
    <div className={`admin-stat-card ${highlight ? 'admin-stat-card--highlight' : ''}`}>
      <p className="admin-stat-card__label">{label}</p>
      <p className="admin-stat-card__value">{value}</p>
    </div>
  )
}

function Panel({ title, linkHref, linkLabel, children }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <h2 className="admin-panel__title">{title}</h2>
        <Link to={linkHref} className="admin-panel__link">{linkLabel}</Link>
      </div>
      <div className="admin-panel__body">{children}</div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalPosts: 0, published: 0, totalEnquiries: 0, unread: 0 })
  const [recentPosts, setRecentPosts] = useState([])
  const [recentEnquiries, setRecentEnquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [all] = await Promise.all([articleService.getAll()])
      const userPosts = all.filter((a) => a.isUserCreated)
      const published = userPosts.filter((a) => !a.isDraft)
      const enquiries = enquiryService.getAll().filter((e) => !e.isArchived)
      const unread = enquiries.filter((e) => !e.isRead)

      setStats({
        totalPosts: userPosts.length,
        published: published.length,
        totalEnquiries: enquiries.length,
        unread: unread.length,
      })
      setRecentPosts(userPosts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5))
      setRecentEnquiries(enquiries.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__heading">
          <h1>Dashboard</h1>
          <p>Welcome back.</p>
        </div>

        {loading ? (
          <p className="admin-loading">Loading…</p>
        ) : (
          <>
            <div className="admin-stats-grid">
              <StatCard label="Total Posts" value={stats.totalPosts} />
              <StatCard label="Published" value={stats.published} />
              <StatCard label="Total Enquiries" value={stats.totalEnquiries} />
              <StatCard label="Unread Enquiries" value={stats.unread} highlight={stats.unread > 0} />
            </div>

            <div className="admin-panels-grid">
              <Panel title="Recent Posts" linkHref="/admin/posts" linkLabel="View all">
                {recentPosts.length === 0 ? (
                  <p className="admin-empty">No posts yet.</p>
                ) : recentPosts.map((post) => (
                  <div key={post.id} className="admin-row">
                    <div className="admin-row__info">
                      <p className="admin-row__title">{post.title}</p>
                      <p className="admin-row__meta">{formatDate(post.createdAt)}</p>
                    </div>
                    <div className="admin-row__actions">
                      <span className={`admin-badge ${post.isDraft ? 'admin-badge--draft' : 'admin-badge--published'}`}>
                        {post.isDraft ? 'Draft' : 'Published'}
                      </span>
                      <Link to={`/create-post?edit=${post.id}`} className="admin-link">Edit</Link>
                    </div>
                  </div>
                ))}
              </Panel>

              <Panel title="Recent Enquiries" linkHref="/admin/enquiries" linkLabel="View all">
                {recentEnquiries.length === 0 ? (
                  <p className="admin-empty">No enquiries yet.</p>
                ) : recentEnquiries.map((e) => (
                  <div key={e.id} className="admin-row">
                    <div className="admin-row__info">
                      <div className="admin-row__name-row">
                        {!e.isRead && <span className="admin-unread-dot" aria-label="Unread" />}
                        <p className="admin-row__title">{e.name}</p>
                      </div>
                      <p className="admin-row__meta">{e.subject}</p>
                    </div>
                    <div className="admin-row__actions">
                      <span className="admin-row__date">{formatDate(e.createdAt)}</span>
                      <Link to={`/admin/enquiries/${e.id}`} className="admin-link">View</Link>
                    </div>
                  </div>
                ))}
              </Panel>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
