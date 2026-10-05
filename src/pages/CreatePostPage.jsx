import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, FileText, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { PostEditor } from '../components/post/PostEditor'
import { DeletePostDialog } from '../components/post/DeletePostDialog'
import { Toast } from '../components/common/Toast'
import { articleService } from '../services/articleService'
import { uniqueSlug } from '../utils/slugify'
import { formatDate } from '../utils/formatDate'
import { LoadingState } from '../components/common/LoadingState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { categoryService } from '../services/categoryService'
import { appConfig } from '../config/appConfig'
import { ErrorState } from '../components/common/ErrorState'

const blankForm = {
  title: '',
  categorySlug: '',
  author: '',
  date: new Date().toISOString().slice(0, 10),
  readingTime: '3 min read',
  excerpt: '',
  image: { src: '', alt: '' },
  bodyText: '',
}

function normalizeForm(article) {
  return {
    title: article.title || '',
    categorySlug: article.category?.slug || '',
    author: article.author || '',
    date: article.date || new Date().toISOString().slice(0, 10),
    readingTime: article.readingTime || '3 min read',
    excerpt: article.excerpt || '',
    image: { src: article.image?.src || '', alt: article.image?.alt || '' },
    bodyText: (article.content || []).filter((block) => block.type === 'paragraph' || block.type === 'heading').map((block) => block.text).join('\n\n'),
  }
}

function toArticle(form, existingArticles, categories) {
  const existingSlugs = existingArticles.map((article) => article.slug)
  const id = existingArticles.find((article) => article.id === form.id)?.id || `user-${Date.now()}`
  const now = new Date().toISOString()
  const content = form.bodyText.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean).map((text) => ({ type: 'paragraph', text }))
  const category = categories.find((item) => item.slug === form.categorySlug)
  return {
    id,
    slug: form.slug || uniqueSlug(form.title, existingSlugs),
    title: form.title.trim(),
    category,
    author: form.author.trim(),
    date: form.date,
    readingTime: form.readingTime.trim() || '3 min read',
    excerpt: form.excerpt.trim(),
    image: { src: form.image.src.trim() || null, alt: form.image.alt.trim() },
    featured: false,
    content,
    relatedArticleIds: [],
    source: 'local-user',
    sourceLabel: 'Local user article',
    sourceUrl: '',
    isUserCreated: true,
    isDraft: Boolean(form.isDraft),
    createdAt: form.createdAt || now,
    updatedAt: now,
  }
}

export function CreatePostPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('edit')
  useDocumentTitle(editId ? 'Edit Article' : 'Create Post')
  const [form, setForm] = useState(blankForm)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [deleteArticle, setDeleteArticle] = useState(null)

  const load = async () => {
    setStatus('loading')
    setLoadError('')
    try {
      const [all, availableCategories] = await Promise.all([articleService.getAll(), categoryService.getAll()])
      setItems(all.filter((item) => item.isUserCreated))
      setCategories(availableCategories)
      if (editId) {
        const existing = all.find((item) => item.id === editId)
        if (existing && existing.isUserCreated) setForm({ ...normalizeForm(existing), id: existing.id, slug: existing.slug, isDraft: existing.isDraft, createdAt: existing.createdAt })
        else setForm(blankForm)
      }
      setStatus('success')
    } catch (error) {
      setLoadError(error.message)
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [editId])

  const drafts = useMemo(() => items.filter((item) => item.isDraft), [items])
  const published = useMemo(() => items.filter((item) => !item.isDraft), [items])

  const handleSave = async (isDraft) => {
    setSubmitting(true)
    try {
      if (!form.title.trim() || !form.categorySlug || !form.excerpt.trim() || !form.bodyText.trim()) {
        setToast('Add a title, category, excerpt and article content first.')
        return
      }
      if (!categories.some((category) => category.slug === form.categorySlug)) {
        setToast('Choose a valid category before saving this article.')
        return
      }
      const all = await articleService.getAll()
      const article = toArticle({ ...form, isDraft }, all, categories)
      if (form.id) await articleService.update(form.id, article)
      else await articleService.create(article)
      setToast(isDraft ? 'Draft saved successfully.' : 'Article published successfully.')
      await load()
      if (!isDraft) window.setTimeout(() => navigate(`/articles/${article.slug}`), 450)
      else navigate(`/create-post?edit=${article.id}`)
    } catch (error) {
      setToast(error.message || 'Could not save the article.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteArticle) return
    try {
      await articleService.delete(deleteArticle.id)
      setDeleteArticle(null)
      setToast('Article deleted.')
      await load()
      if (editId === deleteArticle.id) navigate('/create-post')
    } catch (error) {
      setToast(error.message || 'Could not delete the article.')
    }
  }

  if (status === 'loading') return <section className="section page-section"><Container><LoadingState label={appConfig.apiBaseUrl ? 'Connecting to the editorial API…' : undefined} /></Container></section>
  if (status === 'error') return <section className="section page-section"><Container><ErrorState title="Editorial workspace unavailable" description={loadError} onRetry={load} /></Container></section>

  return <>
    <section className="section page-section create-page"><Container><SectionHeading eyebrow={editId ? 'Edit article' : 'Editorial workspace'} title={editId ? 'Refine your article.' : 'Post a new article.'} description="Create and manage your own content. Source articles remain protected and separate." />
      <div className={`connection-note ${appConfig.apiBaseUrl ? 'connection-note--api' : ''}`} role="status">
        <span className="connection-note__pulse" aria-hidden="true" />
        <div><strong>{appConfig.apiBaseUrl ? 'API mode is configured' : 'Local preview mode'}</strong><p>{appConfig.apiBaseUrl ? 'Article and category data will be read and saved through your configured backend.' : 'This browser uses sample articles and local storage. Set VITE_API_BASE_URL to connect your backend.'}</p></div>
      </div>
      <PostEditor value={form} categories={categories} onChange={setForm} onSaveDraft={() => handleSave(true)} onPublish={() => handleSave(false)} onCancel={() => navigate('/articles')} submitting={submitting} /></Container></section>

    <section className="section section--sand"><Container><div className="manage-posts"><div><span className="eyebrow">{appConfig.apiBaseUrl ? 'Backend content' : 'Browser preview content'}</span><h2>Your drafts & published posts</h2><p>{appConfig.apiBaseUrl ? 'These articles are loaded from and saved to the configured API.' : 'These records are stored in this browser only.'}</p></div><div className="local-posts-grid"><PostList title="Drafts" icon={<FileText size={18} />} items={drafts} empty="No drafts yet." onDelete={setDeleteArticle} /><PostList title="Published" icon={<AlertCircle size={18} />} items={published} empty="No user-published articles yet." onDelete={setDeleteArticle} /></div></div></Container></section>
    <Toast message={toast} onClose={() => setToast('')} />
    <DeletePostDialog article={deleteArticle} onConfirm={handleDelete} onCancel={() => setDeleteArticle(null)} />
  </>
}

function PostList({ title, icon, items, empty, onDelete }) {
  return <div className="local-posts-card"><h3>{icon}{title}</h3>{items.length ? items.map((item) => <div className="local-post-row" key={item.id}><div><strong>{item.title}</strong><small>{formatDate(item.updatedAt)} · {item.isDraft ? 'Draft' : 'Published'}</small></div><div><Link to={`/create-post?edit=${item.id}`} className="icon-button icon-button--small" aria-label={`Edit ${item.title}`}><Pencil size={15} /></Link><button type="button" className="icon-button icon-button--small icon-button--danger" onClick={() => onDelete(item)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div></div>) : <p className="local-empty">{empty}</p>}</div>
}
