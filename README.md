# Shariah Investments — Premium Editorial React Frontend

A production-oriented React/Vite frontend for a modern, distinctive presentation of the public Shariah Investments archive.

## Source policy

**Primary source of truth:** `https://shariahinvestments.in/`

The primary site determines the source article catalogue, article titles, dates, author, categories, visible archive periods, source imagery, and source links. The current public archive verified during the build contains **9 posts**, **2 categories**, and **4 visible archive periods**. The project does not import article/business/branding data from Sapient Consultants or Shariah Investments Global (.io).

A separate halal-investing design reference was treated only as a UX benchmark. The implementation does not copy its branding, content, claims, identity, or exact layouts. The finished UI has its own Shariah Investments visual system: forest green, ivory, brass accents, editorial grids, architectural framing, and a restrained publication-style interaction language.

## Important content note

Article pages load the complete published body from the source site's public WordPress REST API (`/wp-json/wp/v2/posts`) and render it in place. The source URL remains attached as attribution and an optional original-site link; the body is fetched on demand rather than copied into this repository or the app database.

The local article summaries remain available while the full source content loads or if the source API is temporarily unavailable.

## Stack

- React 18
- Vite
- React Router 6
- JavaScript / JSX
- Lucide React
- Modular CSS with centralized design tokens

## Install and run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Repository/data QA (no network required):

```bash
npm run qa
```

## Routes

- `/`
- `/articles`
- `/articles/:slug`
- `/categories`
- `/category/:slug`
- `/archives`
- `/archives/:year/:month`
- `/search`
- `/about`
- `/contact`
- `/create-post`
- `*` → 404 page

## Architecture

Without an app API configured:

```text
UI
 ↓
Pages
 ↓
Hooks / state
 ↓
Services
 ↓
Repository
 ↓
localStorage
```

With `VITE_API_BASE_URL` configured:

```text
UI
 ↓
Pages
 ↓
Hooks / state
 ↓
Services
 ↓
API Repository
 ↓
REST API
 ↓
Backend
 ↓
Database
```

Pages never call `localStorage` directly. The persistence boundary is `src/services/repositories/localStorageArticleRepository.js`.

Setting `VITE_API_BASE_URL` switches app-managed article reads and writes to `src/services/api/apiArticleRepository.js`. Source article bodies are fetched separately from the source site's public WordPress API.

## Folder structure

```text
src/
├── assets/
├── components/
│   ├── articles/
│   ├── categories/
│   ├── common/
│   ├── faq/
│   ├── layout/
│   ├── post/
│   └── search/
├── config/
├── data/
├── hooks/
├── pages/
├── routes/
├── services/
│   ├── api/
│   └── repositories/
├── styles/
├── utils/
├── App.jsx
├── index.css
└── main.jsx
docs/
├── architecture.md
├── backend-api-contract.md
├── backend-integration-guide.md
├── qa-report.md
└── source-verification.md
public/
└── images/
```

## Article data

Source records live in `src/data/articles.js` and use the backend-friendly model:

```text
id
slug
title
category
author
date
readingTime
excerpt
image: { src, alt }
featured
content: []
relatedArticleIds: []
source
isUserCreated
isDraft
createdAt
updatedAt
```

Article bodies are represented through reusable structured content blocks and rendered by `ArticleContent.jsx`.

## Source vs user content

Source content:

```text
source: "reference-site"
isUserCreated: false
```

User-created content:

```text
source: "local-user"
isUserCreated: true
```

Only user-created content can be updated/deleted. Source records are protected.

## localStorage

Only the repository touches browser storage.

```text
shariah-investments-user-posts
shariah-investments-drafts
```

Malformed JSON, missing keys, incorrect shapes and storage write failures are handled without crashing the application.

## Create Post

`/create-post` supports:

- title
- category
- author
- publication date
- reading time
- excerpt
- image URL + alt text
- structured paragraph content
- Save Draft
- Publish Article
- refresh persistence
- editing
- confirmation-gated deletion

Article records use localStorage by default. When a REST API is configured, create, edit, delete and article reads use that API instead. The backend must enforce authentication and ownership for write operations; this frontend does not store credentials or implement authentication.

## Gmail contact

`src/utils/gmailCompose.js` creates a Gmail compose URL using `URLSearchParams`, so recipient, subject and body are encoded correctly and opened in a new browser tab.

The visible public email used by the contact action is the email address publicly shown on the primary source's author/article pages. It is not described in the UI as a separately verified corporate inbox.

## App backend

Backend configuration is centralized in:

```text
src/config/appConfig.js
```

Set the API origin or `/api` base:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

The configured repository uses the endpoints documented in `docs/backend-api-contract.md`, including authenticated `GET /api/me/articles` for the editorial workspace. Leave it unset to use the local preview data. A configured backend error is surfaced; the app will not silently write to localStorage instead. This app API and the source site's read-only WordPress REST API are separate integrations.

## Image architecture

Each source article keeps an explicit article → image mapping. The verified source image URLs point to `shariahinvestments.in` assets. The execution environment could not download those binaries for local vendoring, so the frontend references the source-hosted assets directly and documents every mapping in `public/images/ASSET-SOURCE-NOTES.md`.

No random stock photos, AI-generated replacements, or unrelated third-party images are used.

One source post did not expose a featured image in the public category/archive listing available during verification; that record is explicitly marked instead of being assigned an unrelated image.

## Responsive behavior

The design is composed deliberately across:

- 1440px
- 1366px
- 1280px
- 1024px
- 768px
- 480px
- 430px
- 390px
- 375px

The navigation collapses, grids recompose, forms stack, typography scales, touch targets remain usable, and horizontal overflow is suppressed.

## Deployment

This is a standard Vite SPA. Deploy the generated `dist/` directory to a static host such as Vercel, Netlify, Cloudflare Pages, GitHub Pages with SPA fallback configuration, or an S3/CloudFront-style static origin.
