import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | Shariah Investments`
    return () => {
      document.title = 'Shariah Investments | Halal Investing Education'
    }
  }, [title])
}
