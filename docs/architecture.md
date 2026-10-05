# Architecture

## Article records

```text
React UI
  ↓
Pages
  ↓
Hooks / local state
  ↓
Services
  ↓
Article repository contract
  ↓
localStorage repository (default)
```

`src/services/articleService.js` is the application-facing article API. Pages and components do not know whether records originate in static source data/localStorage or the configured app API.

## Configured app API data flow

```text
React UI
  ↓
Pages
  ↓
Hooks / local state
  ↓
Services
  ↓
API repository
  ↓
REST API
  ↓
Backend
  ↓
Database
```

Set `VITE_API_BASE_URL` to an API origin to select `apiArticleRepository` for article reads and writes without rewriting `ArticleCard`, `ArticleGrid`, `ArticlePage`, `CategoryPage`, `SearchPage`, `Home`, `Header`, `Footer`, or the create-post editor.

## Full source article content

For source-backed article detail pages, `sourceContentService.js` requests the matching post from the primary site's public WordPress REST API. The complete body is sanitized to an HTML allowlist and rendered in the article page. The app retains a concise local summary as a fallback and displays a retryable error if the source API is unavailable. This read-only WordPress integration is separate from the configurable app API above.

## Repository contract

`src/services/repositories/articleRepository.js` defines:

```text
getAll()
getById(id)
getBySlug(slug)
getByCategory(categorySlug)
getByArchive(year, month)
search(query)
create(article)
update(id, article)
delete(id)
```

The default implementation is `localStorageArticleRepository.js`. Setting `VITE_API_BASE_URL` selects `apiArticleRepository.js` as the replacement.

## Source vs user data

Source articles are immutable reference records:

```text
source: "reference-site"
isUserCreated: false
```

User articles use:

```text
source: "local-user"
isUserCreated: true
```

Drafts are represented by `isDraft: true`. Published user posts use `isDraft: false`.

The repository rejects mutation/deletion of source records.

## Article content

Article-specific JSX is intentionally avoided. Each article uses a structured `content` array with reusable block types such as:

- `paragraph`
- `heading`
- `subheading`
- `list`
- `quote`
- `image`
- `note`

`ArticleContent.jsx` is the shared renderer.

Source records in this frontend contain metadata and concise source-derived synopses/key topics plus the original source URL. The primary site's complete article body is retrieved at page view from its public REST API and is not copied into the frontend repository.

## localStorage boundary

Only `src/services/repositories/localStorageArticleRepository.js` accesses browser localStorage. UI files, pages and components do not.

Storage failures and malformed data are treated as recoverable repository errors/empty records rather than unhandled application failures.

## Configuration

`src/config/appConfig.js` centralizes:

- site name
- public contact email used by the Gmail action
- storage keys
- primary source URLs
- `VITE_API_BASE_URL`

No backend URL is duplicated throughout UI code.
