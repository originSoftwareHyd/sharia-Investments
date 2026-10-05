import { ApiError, request } from './apiClient'

const items = (response) => {
  const values = Array.isArray(response?.items) ? response.items : Array.isArray(response) ? response : null
  if (!values) throw new Error('Article API returned an invalid list response: expected an array or an { items } object.')
  return values.map(normalizeArticle)
}

function normalizeArticle(response) {
  const value = response?.item ?? response
  if (
    !value || typeof value !== 'object' ||
    typeof value.id !== 'string' ||
    typeof value.slug !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.category?.slug !== 'string' ||
    typeof value.category?.name !== 'string' ||
    typeof value.author !== 'string' ||
    typeof value.date !== 'string' ||
    typeof value.readingTime !== 'string' ||
    typeof value.excerpt !== 'string' ||
    !Array.isArray(value.content) ||
    !Array.isArray(value.relatedArticleIds) ||
    typeof value.isDraft !== 'boolean'
  ) {
    throw new Error('Article API returned an invalid article. Check the Article response model in docs/backend-api-contract.md.')
  }
  return value
}

async function getNullable(path) {
  try {
    return normalizeArticle(await request(path))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export const apiArticleRepository = {
  async getAll() { return items(await request('/api/me/articles')) },
  async getPublished() { return items(await request('/api/articles')) },
  async getById(id) { return getNullable(`/api/articles/id/${encodeURIComponent(id)}`) },
  async getBySlug(slug) { return getNullable(`/api/articles/${encodeURIComponent(slug)}`) },
  async getByCategory(categorySlug) { return items(await request(`/api/articles/category/${encodeURIComponent(categorySlug)}`)) },
  async getByArchive(year, month) { return items(await request(`/api/articles/archive/${year}/${month}`)) },
  async search(query) { return items(await request(`/api/articles/search?q=${encodeURIComponent(query)}`)) },
  async create(article) {
    return normalizeArticle(await request('/api/articles', { method: 'POST', body: JSON.stringify(article) }))
  },
  async update(id, article) {
    return normalizeArticle(await request(`/api/articles/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(article) }))
  },
  async delete(id) {
    await request(`/api/articles/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  },
}
