import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { siteData } from '../data/siteData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ArchivesPage() {
  useDocumentTitle('Archives')
  return (
    <section className="section page-section">
      <Container>
        <SectionHeading eyebrow="By date" title="Archives" description="The year/month archive periods currently exposed by the primary Shariah Investments website." />
        <div className="archive-timeline">
          {siteData.source.archive.map((item, index) => (
            <Link key={`${item.year}-${item.month}`} to={`/archives/${item.year}/${item.month}`} className="archive-card">
              <span className="archive-card__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="archive-card__icon"><CalendarDays size={19} /></span>
              <span className="archive-card__body"><strong>{item.label}</strong><small>{item.count} {item.count === 1 ? 'article' : 'articles'}</small></span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
