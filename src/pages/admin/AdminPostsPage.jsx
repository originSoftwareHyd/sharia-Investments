import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { articleService } from '../../services/articleService'
import { formatDate } from '../../utils/formatDate'

export function AdminPostsPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const all = await articleService.getAll()
      setPosts(
        all
          .filter((a) => a.isUserCreated)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function togglePublish(post) {
    setBusyId(post.id)
    try {
      await articleService.update(post.id, { ...post, isDraft: !post.isDraft })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function deletePost(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setBusyId(post.id)
    try {
      await articleService.delete(post.id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__heading admin-page__heading--row">
          <div>
            <h1>Posts</h1>
            <p>{posts.length} total</p>
          </div>
          <Link to="/create-post" className="admin-btn admin-btn--primary">
            <Plus size={14} /> New Post
          </Link>
        </div>

        {error && <p className="admin-error-msg">{error}</p>}

        <div className="admin-table-card">
          {loading ? (
            <p className="admin-loading">Loading…</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="admin-table__empty">
                        No posts yet.{' '}
                        <Link to="/create-post" className="admin-link">Create your first post</Link>
                      </td>
                    </tr>
                  ) : posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <span className="admin-table__title">{post.title}</span>
                        {!post.isDraft && (
                          <span className="admin-table__slug">/articles/{post.slug}</span>
                        )}
                      </td>
                      <td className="admin-table__meta">{post.category?.name ?? '—'}</td>
                      <td>
                        <span className={`admin-badge ${post.isDraft ? 'admin-badge--draft' : 'admin-badge--published'}`}>
                          {post.isDraft ? 'Draft' : 'Published'}
                        </span>
                      </td>
                      <td className="admin-table__meta">{formatDate(post.createdAt)}</td>
                      <td>
                        <div className="admin-table__row-actions">
                          <Link to={`/create-post?edit=${post.id}`} className="admin-icon-btn" title="Edit">
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => togglePublish(post)}
                            disabled={busyId === post.id}
                            className="admin-icon-btn"
                            title={post.isDraft ? 'Publish' : 'Unpublish'}
                          >
                            {post.isDraft ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => deletePost(post)}
                            disabled={busyId === post.id}
                            className="admin-icon-btn admin-icon-btn--danger"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
