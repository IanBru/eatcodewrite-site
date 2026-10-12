# Contributing

You can add a blog post or a recipe by opening a pull request.

## Add a blog post

1. Fork this repo and create a branch (e.g. `ftr/my-post` or a feature branch you’ll merge to main).
2. Add a new Markdown file under `content/blog/`, e.g. `content/blog/my-great-post.md`.
3. Use optional YAML front matter:
   - `title` — post title (defaults to filename)
   - `date` — publication date (e.g. `2025-03-05`)
   - `excerpt` — short summary for listings and RSS
   - `image` - optional cover/share image, e.g. `images/my-great-post/cover.jpg` (used in structured data)
4. Write the body in Markdown.
5. Open a PR. Once merged to `main`, the site will rebuild and deploy.

### Images in blog posts

- Put image files in `content/blog/images/<slug>/`, e.g. `content/blog/images/my-great-post/diagram.png`.
- Reference them with a path relative to `content/blog/`:
  - `![Alt text](images/my-great-post/diagram.png)` - plain image
  - `![Alt text](images/my-great-post/diagram.png "Caption text")` - the title becomes a caption (`<figure>`/`<figcaption>`)
- Always write alt text. Images are lazy-loaded and scaled to the column width.
- The build fails if a referenced image is missing, and warns about missing alt text or files over 1 MB.
  Prefer compressed JPEG/WebP for photos and PNG/SVG for diagrams, around 1600px wide at most.

## Add a recipe

1. Fork this repo and create a branch.
2. For a recipe with slug `banana-bread`, add two files under `content/recipes/`:
   - **`banana-bread.recipe.json`** — structured data (Schema.org-style). Required: `name`. Recommended: `recipeIngredient` (array of strings), `recipeYield`, `prepTime`/`cookTime`/`totalTime` (ISO 8601, e.g. `PT30M`), `recipeCategory`, `recipeCuisine`.
   - **`banana-bread.md`** — instructions in Markdown (no front matter needed).
3. Open a PR. Once merged to `main`, the site will rebuild and deploy.

Example `.recipe.json`:

```json
{
  "name": "Banana Bread",
  "recipeCategory": "Baking",
  "recipeYield": "1 loaf",
  "prepTime": "PT15M",
  "cookTime": "PT60M",
  "recipeIngredient": [
    "3 ripe bananas, mashed",
    "1/3 cup melted butter"
  ]
}
```

Thank you for contributing.
