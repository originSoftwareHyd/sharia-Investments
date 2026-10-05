import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Container } from '../components/common/Container'
import { Badge } from '../components/common/Badge'
import { ArticleArtwork } from '../components/articles/ArticleArtwork'
import { ArticleMeta } from '../components/articles/ArticleMeta'
import { ArticleContent } from '../components/articles/ArticleContent'
import { RelatedArticles } from '../components/articles/RelatedArticles'
import { ShareArticle } from '../components/articles/ShareArticle'
import { ErrorState } from '../components/common/ErrorState'
import { articleService } from '../services/articleService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(undefined)
  const [articleError, setArticleError] = useState('')
  const [related, setRelated] = useState([])
  const [relatedError, setRelatedError] = useState('')
  const [sourceArticleHtml, setSourceArticleHtml] = useState('')
  const [sourceContentStatus, setSourceContentStatus] = useState('idle')
  const [sourceContentError, setSourceContentError] = useState('')
  const [sourceRetry, setSourceRetry] = useState(0)
  useDocumentTitle(article?.title || 'Article')

  useEffect(() => {
    let active = true
    setArticle(undefined)
    setArticleError('')
    setRelated([])
    setRelatedError('')
    setSourceArticleHtml('')
    setSourceContentStatus('idle')
    setSourceContentError('')
    articleService.getBySlug(slug).then((next) => {
      if (!active) return
      setArticle(next || null)
      if (next?.sourceUrl && next.source === 'reference-site') {
        setSourceContentStatus('loading')
        articleService.getSourceArticleContent(next.sourceUrl).then((html) => {
          if (active) {
            setSourceArticleHtml(html)
            setSourceContentStatus('success')
          }
        }).catch((error) => {
          if (active) {
            setSourceContentError(error.message)
            setSourceContentStatus('error')
          }
        })
      }
      if (!next?.relatedArticleIds?.length) return
      Promise.all(next.relatedArticleIds.map((id) => articleService.getById(id))).then((items) => {
        if (active) setRelated(items.filter((item) => item && !item.isDraft && item.id !== next.id).slice(0, 3))
      }).catch((error) => {
        if (active) setRelatedError(error.message)
      })
    }).catch((error) => {
      if (active) {
        setArticleError(error.message)
        setArticle(null)
      }
    })
    return () => { active = false }
  }, [slug, sourceRetry])

  if (article === undefined) return <section className="section page-section"><Container><div className="article-loading"><span className="spinner" /><span>Opening article…</span></div></Container></section>
  if (!article) return <section className="section page-section"><Container><ErrorState title={articleError ? 'Article could not be loaded' : 'Article not found'} description={articleError || 'The article may be a draft, removed, or the address may be invalid.'} onRetry={() => setSourceRetry((attempt) => attempt + 1)} /></Container></section>

  return (
    <>
      <section className="article-header">
        <Container>
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/articles">Articles</Link><span>/</span><Link to={`/category/${article.category.slug}`}>{article.category.name}</Link><span>/</span><span aria-current="page">Article</span></nav>
          <Link className="back-link" to="/articles"><ArrowLeft size={16} /> Back to articles</Link>
          <div className="article-header__inner">
            <div className="article-header__eyebrow"><Badge>{article.category.name}</Badge><span>{article.sourceLabel}</span></div>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
            <ArticleMeta article={article} />
          </div>
        </Container>
      </section>

      <section className="section section--article">
        <Container>
          <div className="article-hero"><ArticleArtwork article={article} priority /></div>
          <div className="article-layout">
            <aside className="article-sidebar">
              <ShareArticle title={article.title} />
              {article.sourceUrl && <a className="sidebar-source-link" href={article.sourceUrl} target="_blank" rel="noreferrer">Open original <ArrowUpRight size={15} /></a>}
            </aside>
            <article>
              <ArticleContent
                article={article}
                sourceArticleHtml={sourceArticleHtml}
                sourceContentStatus={sourceContentStatus}
                sourceContentError={sourceContentError}
                onRetrySource={() => setSourceRetry((attempt) => attempt + 1)}
              />
              {article.sourceUrl && <div className="article-source"><span>Primary source</span><a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.sourceUrl} <ArrowUpRight size={14} /></a></div>}
            </article>
          </div>
        </Container>
      </section>
      {relatedError && <Container><p className="source-content-error" role="alert">Related articles could not be loaded. {relatedError}</p></Container>}
      <RelatedArticles articles={related} />
    </>
  )
}
