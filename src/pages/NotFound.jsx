import { ArrowLeft, Home as HomeIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFound() {
  useDocumentTitle('Page not found')

  return <section className="section page-section"><Container><div className="not-found"><span className="not-found__number">404</span><span className="eyebrow">Page not found</span><h1>The page you were looking for has moved.</h1><p>Use the article archive or return to the homepage.</p><div><Link to="/" className="button"><HomeIcon size={16} /> Home</Link><Link to="/articles" className="text-link"><ArrowLeft size={16} /> Articles</Link></div></div></Container></section>
}
