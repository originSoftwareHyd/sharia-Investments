import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const qaDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shariah-qa-'))

async function makeNodeRunnable(relPath) {
  const sourcePath = path.join(root, relPath)
  const outputPath = path.join(qaDir, relPath)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  let source = await fs.readFile(sourcePath, 'utf8')
  source = source.replace(/(from\s+['"]\.\.?\/[^'"]+)(['"])/g, (match, spec, quote) => {
    if (/\.(?:js|jsx|mjs|cjs)$/.test(spec)) return match
    return `${spec}.js${quote}`
  })
  source = source.replace(/(import\(['"]\.\.?\/[^'"]+)(['"]\))/g, (match, spec, quote) => {
    if (/\.(?:js|jsx|mjs|cjs)$/.test(spec)) return match
    return `${spec}.js${quote})`
  })
  await fs.writeFile(outputPath, source)
  return outputPath
}

for (const file of [
  'src/data/categories.js',
  'src/data/articles.js',
  'src/config/appConfig.js',
  'src/services/api/apiClient.js',
  'src/services/api/apiArticleRepository.js',
  'src/utils/gmailCompose.js',
  'src/utils/slugify.js',
  'src/services/repositories/localStorageArticleRepository.js',
]) await makeNodeRunnable(file)

const { categories } = await import(pathToFile(path.join(qaDir, 'src/data/categories.js')))
const { sourceArticles } = await import(pathToFile(path.join(qaDir, 'src/data/articles.js')))
const { localStorageArticleRepository } = await import(pathToFile(path.join(qaDir, 'src/services/repositories/localStorageArticleRepository.js')))
const { request } = await import(pathToFile(path.join(qaDir, 'src/services/api/apiClient.js')))
const { apiArticleRepository } = await import(pathToFile(path.join(qaDir, 'src/services/api/apiArticleRepository.js')))
const { appConfig } = await import(pathToFile(path.join(qaDir, 'src/config/appConfig.js')))
const { uniqueSlug } = await import(pathToFile(path.join(qaDir, 'src/utils/slugify.js')))
const { openGmailCompose } = await import(pathToFile(path.join(qaDir, 'src/utils/gmailCompose.js')))

function pathToFile(file) { return pathToFileURL(file).href }

function createMemoryStorage(initial = {}) {
  const store = new Map(Object.entries(initial))
  return {
    getItem: (key) => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
}

global.window = { localStorage: createMemoryStorage(), location: { origin: 'http://localhost:5173' }, open: (url) => { global.__openedUrl = url } }

const expectedTitles = [
  'Is Gold Still a Good Investment in 2026? Returns, Risks, Long-Term Outlook & Shariah Perspective',
  'Difference Between Conventional and Islamic Finance',
  'What Are Shariah-Compliant Investments? A Complete Guide for Ethical Investing',
  '“ Common Myths About Halal Investing—Debunked”',
  '“Key Principles of Islamic Finance: No Riba, No Gharar, and Halal (permissible )vs Haram (forbidden) Sectors”:',
  'How to Screen for Halal Stocks: Manual Method + Apps/Tools',
  'How to Start Investing Islamically: A Step-by-Step Guide',
  'What is Financial Wellbeing – And Why Should We Care?',
  'How to achive Financial Well Bieng -Being Shariah Compliant',
]

assert.equal(sourceArticles.length, 9)
assert.equal(categories.length, 2)
assert.deepEqual(categories.map((c) => c.slug), ['general-overview', 'myths'])
assert.deepEqual(sourceArticles.map((a) => a.title), expectedTitles)
assert.equal(sourceArticles.filter((a) => a.category.slug === 'general-overview').length, 8)
assert.equal(sourceArticles.filter((a) => a.category.slug === 'myths').length, 1)
assert.equal(new Set(sourceArticles.map((a) => a.id)).size, 9)
assert.equal(new Set(sourceArticles.map((a) => a.slug)).size, 9)
for (const article of sourceArticles) {
  assert.equal(article.isUserCreated, false)
  assert.equal(article.isDraft, false)
  assert.match(article.sourceUrl, /^https:\/\/shariahinvestments\.in\//)
  assert.ok(article.category?.slug)
  assert.ok(article.date)
  assert.ok(article.readingTime)
  assert.ok(article.excerpt)
  if (article.image?.src) assert.match(article.image.src, /^https:\/\/shariahinvestments\.in\//)
  else assert.equal(article.imageStatus, 'no-featured-image-exposed-on-source-category-listing')
}

const source = sourceArticles[0]
await assert.rejects(() => localStorageArticleRepository.delete(source.id))
await assert.rejects(() => localStorageArticleRepository.update(source.id, source))

const draft = {
  id: 'qa-user-1',
  slug: uniqueSlug('Halal Investing Basics', sourceArticles.map((a) => a.slug)),
  title: 'Halal Investing Basics',
  category: categories[0],
  author: 'QA Author',
  date: '2026-10-05',
  readingTime: '3 min read',
  excerpt: 'A QA draft.',
  image: { src: null, alt: '' },
  featured: false,
  content: [{ type: 'paragraph', text: 'Draft content.' }],
  relatedArticleIds: [],
  source: 'local-user',
  sourceLabel: 'Local user article',
  sourceUrl: '',
  isUserCreated: true,
  isDraft: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
await localStorageArticleRepository.create(draft)
assert.equal((await localStorageArticleRepository.getAll()).length, 10)
assert.equal(await localStorageArticleRepository.getBySlug(draft.slug), null)
assert.equal((await localStorageArticleRepository.search('qa author')).length, 1)

const loaded = await localStorageArticleRepository.getById(draft.id)
await localStorageArticleRepository.update(draft.id, { ...loaded, isDraft: false })
assert.ok(await localStorageArticleRepository.getBySlug(draft.slug))
assert.equal((await localStorageArticleRepository.getByArchive(2026, 10)).length, 1)
await localStorageArticleRepository.delete(draft.id)
assert.equal(await localStorageArticleRepository.getById(draft.id), null)

window.localStorage.setItem('shariah-investments-user-posts', '{bad json')
assert.equal((await localStorageArticleRepository.getAll()).length, 9)

openGmailCompose({ to: 'person@example.com', subject: 'Hello & welcome', body: 'Line one\nLine two' })
assert.match(global.__openedUrl, /^https:\/\/mail\.google\.com\/mail\/\?/) 
assert.ok(global.__openedUrl.includes('Hello+%26+welcome'))
assert.ok(global.__openedUrl.includes('Line+one%0ALine+two'))

const apiArticle = {
  id: 'api-article-1',
  slug: 'api-article',
  title: 'API article',
  category: { id: 'cat-1', slug: 'general', name: 'General' },
  content: [{ type: 'paragraph', text: 'API content' }],
  author: 'API Author',
  date: '2026-10-05',
  readingTime: '3 min read',
  excerpt: 'An API-sourced article.',
  relatedArticleIds: [],
  isDraft: false,
}
const originalFetch = global.fetch
const apiRequests = []
global.fetch = async (url, options) => {
  apiRequests.push({ url: String(url), options })
  return new Response(JSON.stringify({ items: [apiArticle] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
appConfig.apiBaseUrl = 'https://api.example.com/api/'
assert.equal((await apiArticleRepository.getPublished())[0].slug, 'api-article')
assert.equal(apiRequests.at(-1).url, 'https://api.example.com/api/articles')
assert.equal(apiRequests.at(-1).options.credentials, 'include')
await apiArticleRepository.getAll()
assert.equal(apiRequests.at(-1).url, 'https://api.example.com/api/me/articles')
appConfig.apiBaseUrl = 'https://api.example.com'
await request('/api/articles')
assert.equal(apiRequests.at(-1).url, 'https://api.example.com/api/articles')
global.fetch = async (url, options) => {
  apiRequests.push({ url: String(url), options })
  return new Response(JSON.stringify({ item: apiArticle }), { status: 201, headers: { 'Content-Type': 'application/json' } })
}
assert.equal((await apiArticleRepository.create(apiArticle)).id, apiArticle.id)
assert.equal(apiRequests.at(-1).options.method, 'POST')
global.fetch = async () => new Response(JSON.stringify({ item: apiArticle }), { status: 200, headers: { 'Content-Type': 'application/json' } })
assert.equal((await apiArticleRepository.getBySlug(apiArticle.slug)).id, apiArticle.id)
global.fetch = async () => new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
assert.equal(await apiArticleRepository.getBySlug('missing-article'), null)
global.fetch = async () => new Response(JSON.stringify({ message: 'Not authorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
await assert.rejects(() => request('/api/me/articles'), /Not authorized/)
global.fetch = originalFetch
appConfig.apiBaseUrl = ''

await fs.rm(qaDir, { recursive: true, force: true })
console.log('QA PASS: source inventory, local and API repository lifecycle, API URL composition, session credentials, API errors, source protection, storage recovery, slug uniqueness and Gmail URL encoding all passed.')
