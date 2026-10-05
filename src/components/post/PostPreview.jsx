export function PostPreview({ article }) {
  return (
    <div className="editor-preview-card">
      {article.image?.src ? (
        <img src={article.image.src} alt={article.image.alt || 'Preview'} width="900" height="600" loading="lazy" />
      ) : (
        <div className="editor-preview-art" aria-hidden="true" />
      )}
      <div className="editor-preview-body">
        <span className="badge">{article.category?.name || 'Category'}</span>
        <h3>{article.title || 'Your article title'}</h3>
        <p>{article.excerpt || 'Your excerpt will appear here.'}</p>
        <div className="article-meta article-meta--compact">
          <span>{article.author || 'Author'}</span>
          <span>{article.date || 'Date'}</span>
          <span>{article.readingTime || 'Reading time'}</span>
        </div>
      </div>
    </div>
  )
}
