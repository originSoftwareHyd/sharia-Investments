import { appConfig } from '../../config/appConfig'
import { sourceArticles } from '../../data/articles'

const USER_POSTS_KEY = appConfig.storageKeys.userPosts
const DRAFTS_KEY = appConfig.storageKeys.drafts

const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

function parseArray(key) {
  if (!hasStorage()) return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeArray(key, value) {
  if (!hasStorage()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function getUserPosts() {
  return parseArray(USER_POSTS_KEY).filter(Boolean)
}

function getDrafts() {
  return parseArray(DRAFTS_KEY).filter(Boolean)
}

function all() {
  return [...sourceArticles, ...getUserPosts(), ...getDrafts()]
}

function findUserArticle(id) {
  return [...getUserPosts(), ...getDrafts()].find((item) => item.id === id)
}

export const localStorageArticleRepository = {
  async getAll() { return all() },
  async getById(id) { return all().find((item) => item.id === id) ?? null },
  async getBySlug(slug) { return all().find((item) => item.slug === slug && !item.isDraft) ?? null },
  async getByCategory(categorySlug) { return all().filter((item) => !item.isDraft && item.category?.slug === categorySlug) },
  async getByArchive(year, month) {
    return all().filter((item) => {
      if (item.isDraft) return false
      const date = new Date(item.date)
      return date.getFullYear() === Number(year) && date.getMonth() + 1 === Number(month)
    })
  },
  async search(query) {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    return all().filter((item) => {
      const content = (item.content || []).map((block) => block.text || (block.items || []).join(' ')).join(' ')
      const topics = (item.sourceContent?.keyTopics || []).join(' ')
      const sourceSummary = item.sourceContent?.summary || ''
      return [item.title, item.excerpt, item.author, item.category?.name, content, topics, sourceSummary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  },
  async create(article) {
    const targetKey = article.isDraft ? DRAFTS_KEY : USER_POSTS_KEY
    const existing = parseArray(targetKey)
    if (!writeArray(targetKey, [...existing, article])) throw new Error('Your browser could not save this article locally. Check storage permissions or available space and try again.')
    return article
  },
  async update(id, article) {
    const existing = findUserArticle(id)
    if (!existing || !existing.isUserCreated) throw new Error('Only user-created articles can be updated.')
    const nextUserPosts = getUserPosts().filter((item) => item.id !== id)
    const nextDrafts = getDrafts().filter((item) => item.id !== id)
    const targetKey = article.isDraft ? DRAFTS_KEY : USER_POSTS_KEY
    const targetItems = article.isDraft ? [...nextDrafts, article] : [...nextUserPosts, article]
    if (!writeArray(USER_POSTS_KEY, nextUserPosts) || !writeArray(DRAFTS_KEY, nextDrafts) || !writeArray(targetKey, targetItems)) {
      throw new Error('Your browser could not update this article locally. Check storage permissions or available space and try again.')
    }
    return article
  },
  async delete(id) {
    const existing = findUserArticle(id)
    if (!existing || !existing.isUserCreated) throw new Error('Source articles cannot be deleted.')
    const nextUserPosts = getUserPosts().filter((item) => item.id !== id)
    const nextDrafts = getDrafts().filter((item) => item.id !== id)
    if (!writeArray(USER_POSTS_KEY, nextUserPosts) || !writeArray(DRAFTS_KEY, nextDrafts)) {
      throw new Error('Your browser could not delete this article locally. Check storage permissions or available space and try again.')
    }
    return true
  },
}
