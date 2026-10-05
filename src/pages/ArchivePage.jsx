import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { ArticleGrid } from '../components/articles/ArticleGrid'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useArticles } from '../hooks/useArticles'
import { archiveLabel } from '../utils/formatDate'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ArchivePage() {
  const { year, month } = useParams()
  const numericMonth = Number(month)
  const numericYear = Number(year)
  const valid = Number.isInteger(numericYear) && Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12
  useDocumentTitle(valid ? archiveLabel(numericYear, numericMonth) : 'Archive')
  const { articles, status, error, reload } = useArticles({ archive: valid ? { year: numericYear, month: numericMonth } : undefined })
  if (!valid) return <section className="section page-section"><Container><ErrorState title="Invalid archive" description="The archive address is not valid." /></Container></section>
  return (
    <section className="section page-section">
      <Container>
        <Link className="back-link" to="/archives"><ArrowLeft size={16} /> All archives</Link>
        <SectionHeading eyebrow="Archive" title={archiveLabel(numericYear, numericMonth)} description={`${status === 'success' ? articles.length : '…'} published ${status === 'success' && articles.length === 1 ? 'article' : 'articles'}.`} />
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState description={error?.message} onRetry={reload} />}
        {status === 'success' && (articles.length ? <ArticleGrid articles={articles} /> : <EmptyState title="No articles in this archive" />)}
      </Container>
    </section>
  )
}
