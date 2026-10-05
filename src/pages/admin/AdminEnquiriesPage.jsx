import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { enquiryService } from '../../services/enquiryService'
import { formatDate } from '../../utils/formatDate'

export function AdminEnquiriesPage() {
  const [searchParams] = useSearchParams()
  const filter = searchParams.get('filter') ?? 'all'
  const q = searchParams.get('q') ?? ''

  const [enquiries, setEnquiries] = useState([])
  const [search, setSearch] = useState(q)

  useEffect(() => {
    let all = enquiryService.getAll()
    if (filter === 'unread') all = all.filter((e) => !e.isRead && !e.isArchived)
    else if (filter === 'archived') all = all.filter((e) => e.isArchived)
    else all = all.filter((e) => !e.isArchived)

    if (q) {
      const needle = q.toLowerCase()
      all = all.filter((e) =>
        e.name.toLowerCase().includes(needle) || e.email.toLowerCase().includes(needle)
      )
    }

    setEnquiries(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }, [filter, q])

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Archived', value: 'archived' },
  ]

  function buildHref(nextFilter, nextQ) {
    const p = new URLSearchParams()
    p.set('filter', nextFilter)
    if (nextQ) p.set('q', nextQ)
    return `/admin/enquiries?${p.toString()}`
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__heading">
          <h1>Enquiries</h1>
        </div>

        <div className="admin-toolbar">
          <div className="admin-tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                to={buildHref(tab.value, q)}
                className={`admin-tab ${filter === tab.value ? 'admin-tab--active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <form
            className="admin-search-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="admin-search-input"
            />
            <Link
              to={buildHref(filter, search)}
              className="admin-btn admin-btn--secondary admin-btn--sm"
            >
              Search
            </Link>
          </form>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table__empty">No enquiries found.</td>
                  </tr>
                ) : enquiries.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {!e.isRead && <span className="admin-unread-dot" title="Unread" />}
                    </td>
                    <td>
                      <span className={`admin-table__title ${!e.isRead ? 'admin-table__title--bold' : ''}`}>
                        {e.name}
                      </span>
                      <span className="admin-table__slug">{e.email}</span>
                    </td>
                    <td className="admin-table__meta">{e.subject}</td>
                    <td className="admin-table__meta">{formatDate(e.createdAt)}</td>
                    <td>
                      <Link to={`/admin/enquiries/${e.id}`} className="admin-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
