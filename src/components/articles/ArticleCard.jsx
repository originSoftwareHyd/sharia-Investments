import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { ArticleArtwork } from './ArticleArtwork'
import { ArticleMeta } from './ArticleMeta'

export function ArticleCard({ article, featured = false }) {
  return (
    <article className={`article-card ${featured ? 'article-card--featured' : ''}`}>
      <Link to={`/articles/${article.slug}`} className="article-card__visual" aria-label={`Read ${article.title}`}>
        <ArticleArtwork article={article} />
        <span className="article-card__arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="article-card__body">
        <Badge>{article.category.name}</Badge>
        <h3><Link to={`/articles/${article.slug}`}>{article.title}</Link></h3>
        <p>{article.excerpt}</p>
        <ArticleMeta article={article} compact />
        <div className="article-card__actions">
          <Link className="text-link" to={`/articles/${article.slug}`}>Read article <ArrowUpRight size={16} /></Link>
          {article.sourceUrl && <a className="article-card__source-link" href={article.sourceUrl} target="_blank" rel="noreferrer">Original <ExternalLink size={14} /></a>}
        </div>
      </div>
    </article>
  )
}
