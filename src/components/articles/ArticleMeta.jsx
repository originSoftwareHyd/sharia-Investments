import { CalendarDays, Clock3, UserRound } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

export function ArticleMeta({ article, compact = false }) {
  return (
    <div className={`article-meta ${compact ? 'article-meta--compact' : ''}`}>
      <span><UserRound size={14} /> {article.author}</span>
      <span><CalendarDays size={14} /> {formatDate(article.date)}</span>
      <span><Clock3 size={14} /> {article.readingTime}</span>
    </div>
  )
}
