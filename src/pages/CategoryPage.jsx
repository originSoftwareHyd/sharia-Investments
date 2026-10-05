import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { ArticleGrid } from '../components/articles/ArticleGrid'
import { EmptyState } from '../components/common/EmptyState'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useArticles } from '../hooks/useArticles'
import { categoryService } from '../services/categoryService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useEffect, useState } from 'react'

export function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(undefined)
  const [categoryError, setCategoryError] = useState('')
  useEffect(() => {
    let active = true
    setCategory(undefined)
    setCategoryError('')
    categoryService.getBySlug(slug).then((result) => {
      if (active) setCategory(result)
    }).catch((error) => {
      if (active) {
        setCategoryError(error.message)
        setCategory(null)
      }
    })
    return () => { active = false }
  }, [slug])
  useDocumentTitle(category?.name || 'Category')
  const { articles, status, error, reload } = useArticles({ categorySlug: slug })
  if (category === undefined) return <section className="section page-section"><Container><LoadingState label="Loading category…" /></Container></section>
  if (!category) return <section className="section page-section"><Container><ErrorState title={categoryError ? 'Category could not be loaded' : 'Category not found'} description={categoryError || 'This category does not exist.'} /></Container></section>
  return (
    <section className="section page-section">
      <Container>
        <Link className="back-link" to="/categories"><ArrowLeft size={16} /> All categories</Link>
        <div className="category-heading">
          <div><span className="eyebrow">Source category</span><h1>{category.name}</h1><p>{category.description}</p></div>
          <div className="category-heading__count"><strong>{articles.length}</strong><span>posts</span></div>
        </div>
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState description={error?.message} onRetry={reload} />}
        {status === 'success' && (articles.length ? <ArticleGrid articles={articles} /> : <EmptyState title="No published articles in this category" />)}
      </Container>
    </section>
  )
}
