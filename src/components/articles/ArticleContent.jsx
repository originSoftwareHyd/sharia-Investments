export function ArticleContent({ article, sourceArticleHtml, sourceContentStatus, sourceContentError, onRetrySource }) {
  const blocks = article.content || []
  const inlineImages = article.sourceContent?.inlineImages || []

  return (
    <div className="article-content">
      {sourceArticleHtml ? (
        <div className="article-content__source" dangerouslySetInnerHTML={{ __html: sourceArticleHtml }} />
      ) : blocks.map((block, index) => {
        const key = `${block.type}-${index}`
        if (block.type === 'heading') return <h2 key={key}>{block.text}</h2>
        if (block.type === 'subheading') return <h3 key={key}>{block.text}</h3>
        if (block.type === 'paragraph') return <p key={key}>{block.text}</p>
        if (block.type === 'list') return <ul key={key}>{block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{item}</li>)}</ul>
        if (block.type === 'quote') return <blockquote key={key}>{block.text}</blockquote>
        if (block.type === 'note') return <aside className="article-note" key={key}>{block.text}</aside>
        return null
      })}

      {!sourceArticleHtml && article.sourceContent?.keyTopics?.length > 0 && (
        <section className="source-topics" aria-labelledby="source-topics-title">
          <span className="eyebrow" id="source-topics-title">Key topics in the source</span>
          <div className="source-topics__grid">
            {article.sourceContent.keyTopics.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
        </section>
      )}

      {!sourceArticleHtml && inlineImages.map((block) => (
        <figure className="source-inline-image" key={block.src}>
          <img src={block.src} alt={block.alt} loading="lazy" width="1000" height="560" />
          <figcaption>{block.caption}</figcaption>
        </figure>
      ))}

      {article.source === 'reference-site' && sourceContentStatus === 'loading' && (
        <p className="source-content-status" role="status">Loading the complete article from shariahinvestments.in…</p>
      )}
      {article.source === 'reference-site' && sourceContentStatus === 'error' && (
        <div className="source-content-error" role="alert">
          <p>The complete article could not be loaded. The summary above is from the local article record. {sourceContentError}</p>
          <button type="button" className="text-button" onClick={onRetrySource}>Retry loading the full article</button>
        </div>
      )}
      {article.source !== 'reference-site' && (
        <div className="source-availability source-availability--local">
          <div>
            <span className="eyebrow">Local article</span>
            <h3>Published from this frontend.</h3>
            <p>This article was created locally through the editorial workspace and is not a mirrored source article.</p>
          </div>
        </div>
      )}
    </div>
  )
}
