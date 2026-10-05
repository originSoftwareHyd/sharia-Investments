import { ArrowUpRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appConfig } from '../../config/appConfig'
import { categories } from '../../data/categories'
import { siteData } from '../../data/siteData'
import { useGmail } from '../../hooks/useGmail'
import { BrandMark } from './BrandMark'

export function Footer() {
  const openContact = useGmail()
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="brand-lockup brand-lockup--footer" to="/">
              <BrandMark footer />
              <span className="brand-wordmark"><strong>{siteData.brand.name}</strong><small>{siteData.brand.descriptor}</small></span>
            </Link>
            <p>A redesigned reading room for the public Shariah Investments archive, with the source site kept at the center of the information architecture.</p>
            <button type="button" className="footer-email" onClick={openContact}><Mail size={16} /> {appConfig.contactEmail}</button>
          </div>

          <div className="footer-col">
            <h3>Explore</h3>
            <Link to="/articles">Articles</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/archives">Archives</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h3>Source categories</h3>
            {categories.map((category) => <Link key={category.slug} to={`/category/${category.slug}`}>{category.name}</Link>)}
          </div>

          <div className="footer-col footer-source">
            <span className="eyebrow">Primary source</span>
            <h3>Read the original archive.</h3>
            <p>Article metadata and source imagery are mapped to the primary public site. Original source pages remain available at their original URLs.</p>
            <a className="footer-arrow-link" href={siteData.source.url} target="_blank" rel="noreferrer">shariahinvestments.in <ArrowUpRight size={16} /></a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {siteData.brand.name}</span>
          <span>{siteData.source.developerCredit}</span>
          <p>{siteData.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
