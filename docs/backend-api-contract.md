# Backend API Contract

These endpoints are called when `VITE_API_BASE_URL` is configured. Set it to the API origin (for example, `https://api.example.com`) or its `/api` base (`https://api.example.com/api`); the client avoids duplicating `/api`. If unset, the frontend uses its local preview repository. Requests include cookies for session-based authentication.

## Articles

### GET /api/articles

Returns published articles for the public archive, categories, search and article pages.

```json
{
  "items": [Article]
}
```

### GET /api/articles/:slug

Returns one published article by slug.

Successful response: HTTP `200` with an `Article` object or `{ "item": Article }`. Return HTTP `404` when no published article exists at that slug.

### GET /api/articles/id/:id

Returns one published article by id. Authorization is required for drafts and unpublished content.

### GET /api/me/articles

Returns all articles owned by the authenticated editor, including drafts. This endpoint is used by the editorial workspace. Require a valid session and return `401` when the editor is not signed in.

### GET /api/articles/category/:slug

Returns published articles for a category.

Successful list responses use `{ "items": [Article] }` (a bare array is also accepted).

### GET /api/articles/archive/:year/:month

Returns published articles for the requested year/month archive.

### GET /api/articles/search?q=

Returns published articles matching title, category, excerpt, author or structured content.

### POST /api/articles

Creates a user-owned article/draft. Require authentication and validate the submitted fields server-side.

Example request:

```json
{
  "title": "A new article",
  "category": {
    "id": "cat-general-overview",
    "slug": "general-overview",
    "name": "General Overview"
  },
  "author": "Author name",
  "date": "2026-10-05",
  "readingTime": "4 min read",
  "excerpt": "…",
  "image": {
    "src": "https://cdn.example.com/article.webp",
    "alt": "Descriptive alternative text"
  },
  "content": [
    {"type": "paragraph", "text": "…"}
  ],
  "isDraft": false
}
```

Expected response: HTTP `201` and the normalized persisted `Article` object (or `{ "item": Article }`).

### PATCH /api/articles/:id

Updates a user-owned article. The backend must enforce ownership and return the normalized persisted `Article` object (or `{ "item": Article }`).

### DELETE /api/articles/:id

Deletes a user-owned article. The backend must reject deletion of source/reference records and return HTTP `204` on success.

## Categories

### GET /api/categories

Expected shape:

```json
{
  "items": [
    {
      "id": "cat-general-overview",
      "slug": "general-overview",
      "name": "General Overview",
      "description": "General overview of Shariah Investments."
    },
    {
      "id": "cat-myths",
      "slug": "myths",
      "name": "Myths",
      "description": "Myths About Islamic Investments."
    }
  ]
}
```

Successful list responses may be a bare array or `{ "items": [...] }`.

## Article response model

```text
id: string
slug: string
title: string
category: { id, slug, name, description }
author: string
date: YYYY-MM-DD
readingTime: string
excerpt: string
image: { src: string | null, alt: string }
featured: boolean
content: ContentBlock[]
relatedArticleIds: string[]
source: "reference-site" | "local-user"
isUserCreated: boolean
isDraft: boolean
createdAt: ISO-8601
updatedAt: ISO-8601
```

`aupdatedAt` is a documentation typo guard: implementations should use the frontend field **`updatedAt`**, not `aupdatedAt`.

## Integration requirements

- Use JSON for request/response bodies and return `Content-Type: application/json` except for `204 No Content`.
- Return errors as `{ "message": "Human-readable explanation" }`; the frontend displays this message.
- Configure CORS for the deployed frontend origin. Because session cookies are included, set `Access-Control-Allow-Credentials: true` and an explicit `Access-Control-Allow-Origin` (not `*`).
- Set secure, HttpOnly, SameSite session cookies and implement CSRF protection for write requests.
- Keep source/reference articles read-only. The standalone source article body is fetched from the primary site's public WordPress API; it is not an app API write operation.
- Do not return drafts in public list/search/category/archive endpoints.
