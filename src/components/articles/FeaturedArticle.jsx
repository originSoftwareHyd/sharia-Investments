import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { ArticleArtwork } from './ArticleArtwork'
import { ArticleMeta } from './ArticleMeta'

export function FeaturedArticle({ article }) {
  return (
    <article className="featured-article">
      <div className="featured-article__visual"><ArticleArtwork article={article} priority /></div>
      <div className="featured-article__body">
        <span className="eyebrow">Featured insight</span>
        <Badge>{article.category.name}</Badge>
        <h2><Link to={`/articles/${article.slug}`}>{article.title}</Link></h2>
        <p>{article.excerpt}</p>
        <ArticleMeta article={article} />
        <Link className="text-link" to={`/articles/${article.slug}`}>Read article <ArrowUpRight size={17} /></Link>
      </div>
    </article>
  )
}
