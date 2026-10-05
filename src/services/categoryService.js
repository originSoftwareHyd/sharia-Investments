import { appConfig } from '../config/appConfig'
import { categories } from '../data/categories'
import { request } from './api/apiClient'
import { articleService } from './articleService'

function categoryItems(response) {
  const values = Array.isArray(response?.items) ? response.items : Array.isArray(response) ? response : null
  if (!values || values.some((item) => !item || typeof item.slug !== 'string' || typeof item.name !== 'string')) {
    throw new Error('Category API returned an invalid response. Each category needs a slug and name.')
  }
  return values
}

export const categoryService = {
  async getAll() {
    if (!appConfig.apiBaseUrl) return categories
    return categoryItems(await request('/api/categories'))
  },
  async getBySlug(slug) { return (await this.getAll()).find((item) => item.slug === slug) ?? null },
  async getWithCounts() {
    const [allCategories, articles] = await Promise.all([this.getAll(), articleService.getPublished()])
    return allCategories.map((category) => ({
      ...category,
      count: category.count ?? articles.filter((article) => article.category?.slug === category.slug).length,
    }))
  },
}
