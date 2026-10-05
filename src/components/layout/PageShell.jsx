import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) }, [pathname, search])
  return null
}

export function PageShell({ children }) {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
