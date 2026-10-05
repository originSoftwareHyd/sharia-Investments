// Simple client-side admin auth using localStorage.
// Change ADMIN_PASSWORD or set VITE_ADMIN_PASSWORD in .env.local to customise.
const ADMIN_PASSWORD = import.meta.env?.VITE_ADMIN_PASSWORD || 'admin@SI2024'
const AUTH_KEY = 'shariah-investments-admin-auth'

function getToken() {
  try { return window.localStorage.getItem(AUTH_KEY) } catch { return null }
}

function setToken(value) {
  try { window.localStorage.setItem(AUTH_KEY, value) } catch { /* noop */ }
}

function clearToken() {
  try { window.localStorage.removeItem(AUTH_KEY) } catch { /* noop */ }
}

export const adminAuth = {
  isAuthenticated() {
    return getToken() === 'authenticated'
  },

  login(password) {
    if (password === ADMIN_PASSWORD) {
      setToken('authenticated')
      return true
    }
    return false
  },

  logout() {
    clearToken()
  },
}
