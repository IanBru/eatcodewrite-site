# Contributing

You can add a blog post or a recipe by opening a pull request.

## Add a blog post

1. Fork this repo and create a branch (e.g. `ftr/my-post` or a feature branch you’ll merge to main).
2. Add a new Markdown file under `content/blog/`, e.g. `content/blog/my-great-post.md`.
3. Use optional YAML front matter:
   - `title` — post title (defaults to filename)
   - `date` — publication date (e.g. `2025-03-05`)
   - `excerpt` — short summary for listings and RSS
4. Write the body in Markdown.
5. Open a PR. Once merged to `main`, the site will rebuild and deploy.

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
