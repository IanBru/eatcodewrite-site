# AI and search discoverability plan

Goal: make eatcodewrite.com easy for search engines and AI crawlers to discover, index, and use.

---

## 1. What we already have

- **Static HTML per page** (blog posts, recipes, index) so every URL returns full content. No JS required to read text.
- **RSS/Atom feeds** at `/feed-code.xml`, `/feed-recipes.xml`, `/feed-all.xml` — good for feed readers and as a machine-readable list of URLs.
- **Semantic HTML** (headings, articles) and clear URLs (`/blog/<slug>`, `/recipes/<slug>`).

---

## 2. Recommended additions

### 2.1 Sitemap (`/sitemap.xml`)

- **What:** XML sitemap listing all public URLs and optional `lastmod`.
- **Why:** Standard way for Google/Bing and many crawlers to discover every page. AI crawlers often use sitemaps too.
- **How:** Generate during build from the same content index used for blog/recipes (so it stays in sync). Emit `https://www.eatcodewrite.com/`, `https://www.eatcodewrite.com/blog/<slug>`, `https://www.eatcodewrite.com/recipes/<slug>`, and any other canonical URLs.
- **Where:** `dist/sitemap.xml` at site root.

### 2.2 `robots.txt` (deferred until go-live)

- **Status:** Not implementing yet; add when you’re ready for the site to be fully crawlable.
- **When ready:** Allow all crawlers and point to the sitemap (and optionally feeds). Example: `User-agent: *` / `Allow: /` / `Sitemap: https://www.eatcodewrite.com/sitemap.xml`. Serve as `dist/robots.txt`.

### 2.3 Optional: JSON index for AIs

- **What:** A single JSON file (e.g. `/index.json`) with a list of pages and metadata: `url`, `title`, `description`, `type` (blog|recipe), `date`, optional `summary`. No full body.
- **Why:** Lightweight, clear structure; AIs and tools can discover all URLs and metadata in one request.
- **Recommendation:** Sitemap + good HTML is the main discovery path. Add JSON index if you want a single “site index” for bots/AI.

### 2.4 Structured data (optional)

- **What:** JSON-LD (e.g. `Article`, `Recipe`) in the HTML.
- **Why:** Helps search engines and some AI tools understand content type and key fields (title, date, ingredients).
- **How:** Emit a `<script type="application/ld+json">` block in each page’s `<head>` or before `</body>` from your build. Schema.org types: `Article` for blog, `Recipe` for recipes.
- **Priority:** After sitemap; add when you want richer snippets and clearer semantics.

---

## 3. Suggested order of implementation

| Step | Item              | Effort  | Impact for bots/AI     |
|------|-------------------|---------|-------------------------|
| 1    | `sitemap.xml`     | Low     | High – full URL list   |
| 2    | JSON index        | Low     | Medium – one-shot list |
| 3    | JSON-LD           | Medium  | Medium – semantics     |
| —    | `robots.txt`      | Low     | Add at go-live         |

---

## 4. How bots and AIs can use this

- **Discovery:** Sitemap (and optionally `/index.json` or feeds). Add `robots.txt` at go-live to point crawlers at the sitemap.
- **Content:** Fetch HTML from sitemap URLs; parse text from semantic HTML. No need for JS execution.
- **Freshness:** Sitemap `lastmod` and feed timestamps help crawlers prioritize.
- **No duplicate content issues:** One canonical URL per page (HTML).

---

## 5. Summary

- **Now:** Sitemap so the site has a machine-readable URL list (crawlers can still find pages via links and feeds; robots.txt deferred until go-live).
- **Nice-to-have:** JSON index for a single “site index” for AIs; JSON-LD for richer semantics.
