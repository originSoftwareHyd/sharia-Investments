import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { CategoryCard } from '../components/categories/CategoryCard'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { categoryService } from '../services/categoryService'
import { useEffect, useState } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function CategoriesPage() {
  useDocumentTitle('Categories')
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      setCategories(await categoryService.getWithCounts())
      setStatus('success')
    } catch (cause) {
      setError(cause.message)
      setStatus('error')
    }
  }
  useEffect(() => { load() }, [])
  return (
    <section className="section page-section">
      <Container>
        <div className="page-heading-row">
          <SectionHeading eyebrow="Browse by source category" title="Categories" description="The primary site currently exposes two categories. No additional taxonomy is fabricated in this frontend." />
          <Link className="text-link" to="/archives">Browse by date <ArrowUpRight size={17} /></Link>
        </div>
        {status === 'loading' && <LoadingState label="Loading categories…" />}
        {status === 'error' && <ErrorState title="Categories could not be loaded" description={error} onRetry={load} />}
        {status === 'success' && <div className="category-grid category-grid--source category-grid--large">
          {categories.map((category, index) => <CategoryCard key={category.slug} category={{ ...category, index: String(index + 1).padStart(2, '0') }} />)}
        </div>}
      </Container>
    </section>
  )
}
