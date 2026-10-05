import { useEffect, useState } from 'react'
import { searchService } from '../services/searchService'

export function useSearch(query, delay = 180) {
  const [results, setResults] = useState([])
  const [status, setStatus] = useState(query ? 'loading' : 'idle')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setError(null)
      setStatus('idle')
      return undefined
    }

    let active = true
    setError(null)
    setStatus('loading')
    const timer = window.setTimeout(async () => {
      try {
        const next = await searchService.search(trimmed)
        if (active) {
          setResults(next)
          setStatus('success')
        }
      } catch (cause) {
        if (active) {
          setError(cause)
          setStatus('error')
        }
      }
    }, delay)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [attempt, delay, query])

  return { results, status, error, reload: () => setAttempt((value) => value + 1) }
}
