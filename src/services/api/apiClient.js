import { appConfig } from '../../config/appConfig'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request(path, options = {}) {
  if (!appConfig.apiBaseUrl) {
    throw new Error('API base URL is not configured.')
  }

  let baseUrl
  try {
    baseUrl = new URL(appConfig.apiBaseUrl, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
    if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('Unsupported protocol.')
  } catch (error) {
    throw new Error('VITE_API_BASE_URL must be a valid HTTP or HTTPS URL.', { cause: error })
  }
  const requestPath = path.startsWith('/') ? path : `/${path}`
  const basePath = baseUrl.pathname.replace(/\/+$/, '')
  const normalizedPath = basePath.endsWith('/api') && requestPath.startsWith('/api/')
    ? requestPath.slice(4)
    : requestPath
  const endpoint = new URL(`${basePath}${normalizedPath}`, baseUrl.origin)
  let response
  try {
    response = await fetch(endpoint, {
      ...options,
      credentials: 'include',
      signal: options.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    })
  } catch (error) {
    throw new Error(`Could not reach the article API at ${baseUrl.origin}. Check the API URL, server availability, and CORS settings.`, { cause: error })
  }

  if (!response.ok) {
    let details = ''
    try {
      const body = await response.json()
      details = body.message || body.error || ''
    } catch {
      // The server may return an empty or non-JSON error response.
    }
    throw new ApiError(details || `API request failed with status ${response.status}.`, response.status)
  }

  if (response.status === 204) return null
  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  if (!contentType.includes('application/json')) {
    throw new Error(`Article API returned ${contentType || 'an unsupported response'} instead of JSON.`)
  }
  try {
    return await response.json()
  } catch (error) {
    throw new Error('Article API returned malformed JSON.', { cause: error })
  }
}
