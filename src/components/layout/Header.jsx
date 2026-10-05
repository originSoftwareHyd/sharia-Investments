import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { MobileMenu } from './MobileMenu'
import { BrandMark } from './BrandMark'
import { siteData } from '../../data/siteData'

export function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="brand-lockup" to="/" aria-label="Shariah Investments home">
            <BrandMark />
            <span className="brand-wordmark">
              <strong>{siteData.brand.name}</strong>
              <small>{siteData.brand.descriptor}</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {siteData.navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => isActive ? 'active' : undefined}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="icon-button header-search" to="/search" aria-label="Search the archive"><Search size={18} /></Link>
            <Link className="header-post" to="/create-post">+ Post New Article</Link>
            <button className="icon-button mobile-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <div id="mobile-navigation"><MobileMenu open={open} onClose={() => setOpen(false)} /></div>
    </>
  )
}
