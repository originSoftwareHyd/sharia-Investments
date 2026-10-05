import { ArticleCard } from './ArticleCard'

export function RelatedArticles({ articles }) {
  if (!articles.length) return null
  return (
    <section className="section section--tight">
      <div className="section-heading">
        <span className="eyebrow">Keep reading</span>
        <h2>Related articles</h2>
      </div>
      <div className="article-grid article-grid--three">
        {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
      </div>
    </section>
  )
}
