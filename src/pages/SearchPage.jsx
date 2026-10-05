import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '../components/common/Container'
import { SectionHeading } from '../components/common/SectionHeading'
import { SearchBar } from '../components/search/SearchBar'
import { SearchResults } from '../components/search/SearchResults'
import { useSearch } from '../hooks/useSearch'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  useDocumentTitle(query ? `Search: ${query}` : 'Search')
  const { results, status, error, reload } = useSearch(query)
  const countText = useMemo(() => query && status === 'success' ? `${results.length} result${results.length === 1 ? '' : 's'}` : '', [query, results.length, status])
  const setQuery = (next) => {
    const value = next.trimStart()
    if (value) setParams({ q: value })
    else setParams({})
  }
  return (
    <section className="section page-section">
      <Container>
        <SectionHeading eyebrow="Find in the archive" title="Search" description="Search titles, categories, excerpts, authors and the structured source information attached to each article." />
        <div className="search-layout search-layout--wide">
          <SearchBar value={query} onChange={setQuery} onClear={() => setParams({})} autoFocus />
          <div className="search-result-heading">{query ? <span>{countText || 'Searching…'}</span> : <span>Try “finance”, “gold”, “halal”, “stocks” or “wellbeing”.</span>}</div>
          {status === 'loading' ? <LoadingState label="Searching the archive…" /> : status === 'error' ? <ErrorState title="Search failed" description={error?.message || 'The article service could not complete the search.'} onRetry={reload} /> : <SearchResults results={results} query={query} />}
        </div>
      </Container>
    </section>
  )
}
