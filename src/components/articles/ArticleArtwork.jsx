import { useState } from 'react'
import { BookOpenText } from 'lucide-react'

export function ArticleArtwork({ article, className = '', priority = false }) {
  const [failed, setFailed] = useState(false)
  if (article.image?.src && !failed) {
    return (
      <div className={`article-artwork article-artwork--image ${className}`}>
        <img
          src={article.image.src}
          alt={article.image.alt}
          width="380"
          height="220"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  return (
    <div className={`article-artwork article-artwork--pattern ${className}`}>
      <span className="article-artwork__index">SI / {String(article.title?.charAt(0) || '•').toUpperCase()}</span>
      <span className="article-artwork__arch" aria-hidden="true" />
      <BookOpenText size={28} strokeWidth={1.25} aria-hidden="true" />
      <small>{article.imageStatus ? 'No source featured image' : article.category?.name || 'Article'}</small>
    </div>
  )
}
