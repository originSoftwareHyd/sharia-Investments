import { ArticleCard } from './ArticleCard'

export function ArticleGrid({ articles, featuredFirst = false }) {
  return (
    <div className={`article-grid ${featuredFirst ? 'article-grid--featured-first' : ''}`}>
      {articles.map((article, index) => <ArticleCard key={article.id} article={article} featured={featuredFirst && index === 0} />)}
    </div>
  )
}
