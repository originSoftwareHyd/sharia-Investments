import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAuth } from '../../hooks/useAdminAuth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Small delay for UX
    setTimeout(() => {
      const ok = adminAuth.login(password)
      if (ok) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError('Incorrect password. Please try again.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-brand-mark">
            <span>SI</span>
          </div>
          <h1>Shariah Investments</h1>
          <p>Sign in to the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              placeholder="Enter admin password"
            />
          </label>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="admin-login-hint">
          Default password: <code>admin@SI2024</code> — set{' '}
          <code>VITE_ADMIN_PASSWORD</code> in <code>.env.local</code> to change it.
        </p>
      </div>
    </div>
  )
}
