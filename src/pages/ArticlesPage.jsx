import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { ArticleGrid } from '../components/articles/ArticleGrid'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'
import { useArticles } from '../hooks/useArticles'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ArticlesPage() {
  useDocumentTitle('Articles')
  const { articles, status, error, reload } = useArticles()
  return (
    <section className="section page-section">
      <Container>
        <div className="page-heading-row">
          <SectionHeading eyebrow="The source archive" title="Articles" description="Nine published articles mapped from the primary Shariah Investments website. The presentation is new; the source record stays attached to every item." />
          <Link className="text-link" to="/search">Search <ArrowUpRight size={17} /></Link>
        </div>
        {status === 'loading' && <LoadingState label="Loading the source archive…" />}
        {status === 'error' && <ErrorState description={error?.message} onRetry={reload} />}
        {status === 'success' && (articles.length ? <ArticleGrid articles={articles} /> : <EmptyState />)}
      </Container>
    </section>
  )
}
