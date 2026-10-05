# QA Report

## Source verification

The live primary site was re-checked during the correction pass.

Verified source inventory:

- 9 public posts
- 2 categories: General Overview and Myths
- 4 visible archive periods: September 2026, November 2022, November 2019, October 2019
- public author page for `mujeeb.ansari@gmail.com`
- primary-site image URLs mapped by article where exposed
- source footer credit: `Designed & Developed by Code Supply Co.`

See `source-verification.md` for the inventory and image mapping.

## Automated checks

`npm run qa` validates the source dataset and repository behavior without requiring a network connection.

The QA suite covers:

- exactly 9 source articles
- 2 source categories
- expected archive periods
- expected titles/dates/reading times
- all source URLs on `shariahinvestments.in`
- image mappings on `shariahinvestments.in` or an explicit documented no-image status
- unique ids/slugs
- search
- category filtering
- archive filtering
- source protection from deletion/update
- create draft
- refresh-style persistence
- publish/update
- delete
- malformed localStorage recovery
- duplicate-safe slug generation
- Gmail compose URL encoding

## Static source validation

All `.js`/`.jsx` files are transpile-checked with the installed TypeScript parser during the correction pass.

## Build status

The final project includes a standard Vite production script:

```bash
npm run build
```

During this execution, the public npm registry was unavailable/timed out, so a clean dependency install could not be completed in the sandbox and the production bundle could not honestly be marked as executed here.

## Browser/visual status

Chromium is installed in the environment. A headless browser capture was previously attempted but timed out, so this report does not claim a completed screenshot-based browser pass. Responsive styles were reviewed for the requested breakpoint set and the application contains explicit mobile recomposition rules.

## Important honesty rule

No test is marked PASS merely because the script exists. The report distinguishes checks actually run from checks blocked by the execution environment.
