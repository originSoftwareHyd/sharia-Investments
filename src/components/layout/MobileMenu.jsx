import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { siteData } from '../../data/siteData'

export function MobileMenu({ open, onClose }) {
  const firstLinkRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    window.requestAnimationFrame(() => firstLinkRef.current?.focus())
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="container mobile-menu__inner">
        <div className="mobile-menu__kicker">Shariah Investments</div>
        <nav className="mobile-menu__nav" aria-label="Mobile primary navigation">
          {siteData.navigation.map((item, index) => <Link key={item.to} ref={index === 0 ? firstLinkRef : undefined} to={item.to} onClick={onClose}>{item.label}</Link>)}
          <Link to="/search" onClick={onClose}>Search</Link>
        </nav>
      </div>
    </div>
  )
}
