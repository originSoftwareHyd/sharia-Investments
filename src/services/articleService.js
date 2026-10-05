import { appConfig } from '../config/appConfig'
import { apiArticleRepository } from './api/apiArticleRepository'
import { localStorageArticleRepository } from './repositories/localStorageArticleRepository'
import { getSourceArticleContent } from './sourceContentService'

let repository = appConfig.apiBaseUrl ? apiArticleRepository : localStorageArticleRepository

export const setArticleRepository = (nextRepository) => {
  repository = nextRepository
}

export const articleService = {
  async getSourceArticleContent(sourceUrl) { return getSourceArticleContent(sourceUrl) },
  async getAll() { return repository.getAll() },
  async getPublished() {
    if (repository.getPublished) return repository.getPublished()
    return (await repository.getAll()).filter((item) => !item.isDraft)
  },
  async getById(id) { return repository.getById(id) },
  async getBySlug(slug) { return repository.getBySlug(slug) },
  async getByCategory(categorySlug) { return repository.getByCategory(categorySlug) },
  async getByArchive(year, month) { return repository.getByArchive(year, month) },
  async search(query) { return repository.search(query) },
  async create(article) { return repository.create(article) },
  async update(id, article) { return repository.update(id, article) },
  async delete(id) { return repository.delete(id) },
}
