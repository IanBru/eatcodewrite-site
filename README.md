# Eat Code Write

Static site for [eatcodewrite.com](https://www.eatcodewrite.com): technical blog posts (code) and recipes (eat).

- **Blog**: Markdown in `content/blog/` → HTML at build; listed at `/blog`, feed at `/feed.xml`.
- **Recipes**: Markdown instructions + JSON ingredients in `content/recipes/`; Schema.org-aligned; listed at `/recipes`, optional feed at `/recipes/feed.xml`.
- **Preview**: Push a branch named `ftr/*` to deploy to `https://www.eatcodewrite.com/preview/<branch-slug>/`; preview is noindexed. Delete the branch to remove the preview.

## Build

```bash
npm install
cd app && npm install && cd ..
npm run build
```

Optional: generate short summaries for entries that don’t have a `<slug>.summary.md` file (used on the home list). The deploy workflow runs this via AWS Bedrock (Titan Text Lite) using the same OIDC role; new summary files are written under `content/blog/` and `content/recipes/`, then committed and pushed so we don’t re-summarize. Locally, set `AWS_REGION` (and AWS credentials) and run `npm run summarize`.

Output is in `dist/`. Serve `dist/` locally to test.

## Deploy

- **Production**: Push to `main` → GitHub Actions builds and syncs `dist/` to S3; CloudFront is invalidated. Requires repo secrets: `AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.
- **Preview**: Push to a branch like `ftr/your-feature` → deploys to `/preview/ftr-your-feature/`. Requires `AWS_ROLE_ARN_PREVIEW` in addition.

## Contributing

Want to add a recipe or a blog post? See [CONTRIBUTING.md](CONTRIBUTING.md).
