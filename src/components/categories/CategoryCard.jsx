import { ArrowUpRight, BookOpen, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'

const iconFor = (slug) => slug === 'myths' ? Layers3 : BookOpen

export function CategoryCard({ category }) {
  const Icon = iconFor(category.slug)
  return (
    <Link to={`/category/${category.slug}`} className="category-card">
      <span className="category-card__index">{category.index || '—'}</span>
      <div className="category-card__icon"><Icon size={21} strokeWidth={1.45} /></div>
      <div className="category-card__body">
        <span className="eyebrow">Source category</span>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        {category.count !== undefined && <small>{category.count} {category.count === 1 ? 'article' : 'articles'}</small>}
      </div>
      <ArrowUpRight size={19} className="category-card__arrow" />
    </Link>
  )
}
