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

### 2.2 `robots.txt`

- **What:** Allow all crawlers; point to sitemap and optionally to feeds.
- **Example:**
  ```
  User-agent: *
  Allow: /

  Sitemap: https://www.eatcodewrite.com/sitemap.xml
  ```
- **Why:** Tells bots they can crawl the site and where to find the sitemap. No need to disallow unless you add areas you want to hide later.
- **Where:** `dist/robots.txt` (or served from root); can be static or generated at build.

### 2.3 Optional: Markdown or JSON index for AIs

- **Option A – Publish markdown:**  
  Expose the same markdown you use to generate HTML (e.g. under `/content/` or `/raw/`) as static `.md` files. Pros: AIs can consume raw text without parsing HTML. Cons: Duplicate content, possible SEO duplication if not handled (e.g. noindex or separate subdomain).
- **Option B – JSON index (recommended over raw markdown for “index” use):**  
  Build a single JSON file (e.g. `/index.json`) with a list of pages and metadata: `url`, `title`, `description`, `type` (blog|recipe), `date`, optional `summary`. No full body. Pros: Lightweight, clear structure, no duplicate body content. AIs and tools can discover all URLs and metadata in one request.
- **Recommendation:** Prefer **sitemap + good HTML** as the main discovery path. Add **JSON index** if you want a single “site index” for bots/AI; skip publishing full markdown unless you have a specific need (e.g. a separate docs/canonical-markdown subdomain with noindex on the main site).

### 2.4 Structured data (optional)

- **What:** JSON-LD (e.g. `Article`, `Recipe`) in the HTML.
- **Why:** Helps search engines and some AI tools understand content type and key fields (title, date, ingredients).
- **How:** Emit a `<script type="application/ld+json">` block in each page’s `<head>` or before `</body>` from your build. Schema.org types: `Article` for blog, `Recipe` for recipes.
- **Priority:** After sitemap and robots.txt; add when you want richer snippets and clearer semantics.

---

## 3. Suggested order of implementation

| Step | Item              | Effort  | Impact for bots/AI     |
|------|-------------------|---------|-------------------------|
| 1    | `sitemap.xml`     | Low     | High – full URL list   |
| 2    | `robots.txt`      | Low     | High – crawl + sitemap |
| 3    | JSON index        | Low     | Medium – one-shot list |
| 4    | JSON-LD           | Medium  | Medium – semantics     |
| 5    | Publish markdown  | Low–med | Optional – only if needed |

---

## 4. How bots and AIs can use this

- **Discovery:** `robots.txt` → `sitemap.xml` (and optionally `/index.json` or feeds).
- **Content:** Fetch HTML from sitemap URLs; parse text from semantic HTML. No need for JS execution.
- **Freshness:** Sitemap `lastmod` and feed timestamps help crawlers prioritize.
- **No duplicate content issues:** One canonical URL per page (HTML); avoid serving identical full-text markdown on the same domain without noindex or a clear canonical strategy.

---

## 5. Summary

- **Must-have:** Sitemap + robots.txt so the site is fully discoverable and crawlable.
- **Nice-to-have:** JSON index for a single “site index” for AIs; JSON-LD for richer semantics.
- **Optional:** Expose markdown only if you have a specific use case and handle duplication/canonicalization.
