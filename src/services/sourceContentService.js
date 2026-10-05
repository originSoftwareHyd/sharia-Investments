import { appConfig } from '../config/appConfig'

const allowedTags = new Set([
  'a', 'b', 'blockquote', 'br', 'caption', 'em', 'figcaption', 'figure',
  'h2', 'h3', 'h4', 'hr', 'i', 'img', 'li', 'ol', 'p', 'strong', 'table',
  'tbody', 'td', 'th', 'thead', 'tr', 'ul',
])
const removableTags = new Set(['audio', 'button', 'embed', 'form', 'iframe', 'object', 'script', 'style', 'svg', 'video'])

function safeUrl(value, baseUrl, protocols) {
  try {
    const url = new URL(value, baseUrl)
    return protocols.includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export function sanitizeSourceArticleHtml(html) {
  const sourceOrigin = new URL(appConfig.sourceUrls.primary).origin
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const elements = [...parsed.body.querySelectorAll('*')]

  for (const element of elements) {
    const tag = element.tagName.toLowerCase()
    if (removableTags.has(tag)) {
      element.remove()
      continue
    }
    if (!allowedTags.has(tag)) {
      element.replaceWith(...element.childNodes)
      continue
    }

    const originalUrl = tag === 'a' ? element.getAttribute('href') : tag === 'img' ? element.getAttribute('src') : null
    const originalAlt = tag === 'img' ? element.getAttribute('alt') || '' : ''
    for (const attribute of [...element.attributes]) element.removeAttribute(attribute.name)

    if (tag === 'a' && originalUrl) {
      const href = safeUrl(originalUrl, sourceOrigin, ['http:', 'https:', 'mailto:'])
      if (href) {
        element.setAttribute('href', href)
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      }
    } else if (tag === 'img') {
      const src = originalUrl ? safeUrl(originalUrl, sourceOrigin, ['https:']) : null
      if (!src || new URL(src).origin !== sourceOrigin) {
        element.remove()
        continue
      }
      element.setAttribute('src', src)
      element.setAttribute('alt', originalAlt)
      element.setAttribute('loading', 'lazy')
    }
  }

  return parsed.body.innerHTML
}

export async function getSourceArticleContent(sourceUrl) {
  const source = new URL(sourceUrl)
  const primarySite = new URL(appConfig.sourceUrls.primary)
  if (source.origin !== primarySite.origin) {
    throw new Error('The article source does not match the configured primary website.')
  }

  const sourceSlug = source.pathname.split('/').filter(Boolean).at(-1)
  if (!sourceSlug) throw new Error('The source article address is invalid.')

  const endpoint = new URL('/wp-json/wp/v2/posts', source.origin)
  endpoint.searchParams.set('slug', sourceSlug)
  endpoint.searchParams.set('_fields', 'slug,content')
  const response = await fetch(endpoint, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`The source article could not be loaded (HTTP ${response.status}).`)
  }

  const posts = await response.json()
  const post = Array.isArray(posts) ? posts.find((item) => item.slug === sourceSlug) : null
  if (!post || typeof post.content?.rendered !== 'string') {
    throw new Error('The full source article is not available through the source website API.')
  }

  const content = sanitizeSourceArticleHtml(post.content.rendered)
  if (!content.trim()) {
    throw new Error('The source website returned an empty article body.')
  }
  return content
}
