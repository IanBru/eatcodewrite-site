# AGENTS.md - eatcodewrite-site

Blog and recipe site for eatcodewrite.com. Markdown content builds to static HTML
plus RSS/Atom feeds. Preview deployments on ftr/* branches.

## Key directories

```
content/blog/        - Markdown blog posts -> /blog listing + /feed-code.xml
content/recipes/     - Markdown instructions + JSON ingredients -> /recipes listing
app/src/             - React (Vite) UI (listings, post views, search)
scripts/
  build-content.js   - parses content/, generates HTML and feeds
  summarize.js       - Bedrock Titan auto-summaries (run by CI, commits result)
  system-test.js     - validates feeds and structure
```

## Summaries

Each post can have a <slug>.summary.md sidecar. If missing, summarize.js generates
one via Bedrock Titan and commits it so future deploys skip re-summarization.

## Build

```
npm run build       # content build + Vite app build -> dist/
```

## Deploy

GitHub Actions: validate -> build -> S3 sync -> CloudFront invalidation.
Preview: push to ftr/* -> deploys to /preview/<branch-slug>/ (noindexed).
Delete branch to remove preview.

## Feeds

- /feed-code.xml      - blog only
- /feed-recipes.xml   - recipes only
- /feed-all.xml       - combined
