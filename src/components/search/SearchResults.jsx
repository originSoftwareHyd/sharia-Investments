import { ArticleCard } from '../articles/ArticleCard'
import { EmptyState } from '../common/EmptyState'

export function SearchResults({ results, query }) {
  if (!query) return <EmptyState title="Search the editorial archive" description="Try a topic such as halal trading, Islamic finance or market education." />
  if (!results.length) return <EmptyState title={`No results for “${query}”`} description="Try a broader phrase or a category name." />
  return <div className="article-grid">{results.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
}
