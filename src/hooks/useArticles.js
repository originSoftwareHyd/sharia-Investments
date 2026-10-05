import { useCallback, useEffect, useState } from 'react'
import { articleService } from '../services/articleService'

export function useArticles({ categorySlug, archive, query } = {}) {
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      let result
      if (query) result = await articleService.search(query)
      else if (categorySlug) result = await articleService.getByCategory(categorySlug)
      else if (archive) result = await articleService.getByArchive(archive.year, archive.month)
      else result = await articleService.getPublished()
      setArticles(result)
      setStatus('success')
    } catch (cause) {
      setError(cause)
      setStatus('error')
    }
  }, [archive, categorySlug, query])

  useEffect(() => { load() }, [load])

  return { articles, status, error, reload: load }
}
