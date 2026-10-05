# Backend Integration Guide

## 1. Architecture

The UI calls hooks/pages, which call services. Services delegate to a repository. By default the local preview repository uses localStorage; setting `VITE_API_BASE_URL` selects the REST API repository for app-managed article records. A configured API failure is shown to the user and does not silently fall back to localStorage.

## 2. API configuration

`src/config/appConfig.js` reads:

```text
VITE_API_BASE_URL
```

Set the API origin or `/api` base in `.env.local`, for example `VITE_API_BASE_URL=http://localhost:4000` or `VITE_API_BASE_URL=http://localhost:4000/api`. Restart Vite after changing environment variables. The backend base URL should not be hardcoded elsewhere. The public WordPress REST API at `https://shariahinvestments.in/wp-json/wp/v2/` is a separate, read-only integration used to load full source articles.

## 3. API client

`src/services/api/apiClient.js` is the single fetch boundary. It handles base URL composition, JSON headers, credentialed requests, response validation and clear network/HTTP error messages.

## 4. API repository

`src/services/api/apiArticleRepository.js` mirrors the repository contract and is selected automatically when `VITE_API_BASE_URL` is non-empty. Public listing uses `GET /api/articles`; the editor uses authenticated `GET /api/me/articles` to load drafts and owned posts.

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

Switching the configured repository does not require page/component changes.

## 5. GET behavior

The GET methods map directly to the documented article endpoints. Normalize API responses into the same frontend `Article` model before returning them from the repository.

## 6. POST/PATCH/DELETE behavior

The frontend editor already validates and normalizes local user content. The backend must become the authoritative source for identity, ownership, validation, authorization and persistence. The frontend sends session cookies; add the sign-in flow through the backend's chosen auth solution before production writes are enabled.

## 7. Search

The UI calls `searchService.search(query)`. The local implementation filters title, category, excerpt, author and structured content. The API repository can replace that local filter with server search while keeping the search UI unchanged.

## 8. Authentication preparation

No sign-in screen is implemented in the current frontend. Do not add browser-stored passwords or long-lived credentials. A production backend should authorize create/edit/delete requests, return ownership/authorization decisions, and provide a sign-in/session flow. See the CORS, cookie and CSRF requirements in `backend-api-contract.md`.

## 9. Images and media

The editor currently accepts a URL plus alt text. A future upload flow should return the same `{src, alt}` shape. Provider-specific code should live in a service boundary so Cloudinary, S3, a backend endpoint or a CDN can be swapped without changing article presentation.

## 10. Errors and loading

The page layer already exposes loading/error/empty states. A future repository can reject failed requests and the existing hooks/pages can surface those failures through `ErrorState`.

## 11. Drafts

The frontend uses `isDraft` to distinguish draft/published user records. The backend can preserve that field or expose dedicated draft endpoints, provided the repository returns the same frontend model.
