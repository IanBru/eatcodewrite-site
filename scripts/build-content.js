#!/usr/bin/env node
/**
 * Build content: blog (markdown→HTML), recipes (markdown+JSON→HTML), RSS feeds.
 * Writes to dist/ and copies public/ into dist/.
 * Metadata: author, datePublished, dateUpdated from front matter / recipe JSON, with git fallback.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

const blogDir = path.join(contentDir, 'blog');
const recipesDir = path.join(contentDir, 'recipes');
const distBlogDir = path.join(distDir, 'blog');
const distRecipesDir = path.join(distDir, 'recipes');
const baseUrl = process.env.SITE_BASE_URL || 'https://www.eatcodewrite.com';

// Ensure dist and output dirs exist
function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

ensureDir(distDir);
ensureDir(distBlogDir);
ensureDir(distRecipesDir);

// Copy public assets to dist
if (fs.existsSync(publicDir)) {
  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const e of entries) {
    const src = path.join(publicDir, e.name);
    const dest = path.join(distDir, e.name);
    if (e.isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/**
 * Get author and dates from git for a content file (path relative to repo root).
 * Returns { author, datePublished, dateUpdated } or {} if git unavailable / file not tracked.
 */
function getGitFileMeta(relPath) {
  const gitPath = relPath.split(path.sep).join('/');
  const opts = { cwd: rootDir, encoding: 'utf-8' };
  try {
    const first = execSync(`git log --follow --reverse --format=%an%n%aI -1 -- "${gitPath}"`, opts).trim();
    const last = execSync(`git log --follow --format=%aI -1 -- "${gitPath}"`, opts).trim();
    if (!first || !last) return {};
    const [author, datePublished] = first.split('\n');
    return { author: author || undefined, datePublished: datePublished || undefined, dateUpdated: last || undefined };
  } catch {
    return {};
  }
}

// Front matter (blog): title, date (or datePublished), dateUpdated (or updated), author.
// Recipe JSON: name, datePublished, dateModified (or dateUpdated/updated), author.
// Any of these can be omitted; getGitFileMeta() is used as fallback for author and dates.
// Simple front matter parse (--- ... --- then body)
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { front: {}, body: content };
  const front = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) front[m[1]] = m[2].trim().replace(/\r$/, '');
  }
  return { front, body: match[2] };
}

// Markdown to HTML (use marked if available, else escape and preserve paragraphs)
let parseMd;
try {
  const mod = await import('marked');
  const m = mod.default ?? mod;
  if (typeof m.parse === 'function') parseMd = (text) => m.parse(text, { async: false });
} catch {
  parseMd = null;
}

function mdToHtml(md) {
  if (parseMd) {
    return parseMd(md);
  }
  return md
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('\n');
}

// Blog: content/blog/*.md → dist/blog/<slug>.html + index.json (exclude *.summary.md)
const blogPosts = [];
if (fs.existsSync(blogDir)) {
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md') && !f.endsWith('.summary.md'));
  for (const file of files) {
    const slug = path.basename(file, '.md');
    const relPath = path.join('content', 'blog', file);
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { front, body } = parseFrontMatter(raw);
    const gitMeta = getGitFileMeta(relPath);
    const title = front.title ?? slug;
    const datePublished = front.date ?? front.datePublished ?? gitMeta.datePublished ?? '';
    const dateUpdated = front.dateUpdated ?? front.updated ?? gitMeta.dateUpdated ?? datePublished;
    const author = front.author ?? gitMeta.author ?? '';
    const excerpt = front.excerpt ?? '';
    const summaryPath = path.join(blogDir, `${slug}.summary.md`);
    const summary = fs.existsSync(summaryPath) ? fs.readFileSync(summaryPath, 'utf-8').trim() : excerpt;
    const htmlBody = mdToHtml(body);
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      datePublished: datePublished || undefined,
      dateModified: dateUpdated || undefined,
      author: author ? { '@type': 'Person', name: author } : undefined,
      url: `${baseUrl}/blog/${slug}`,
    };
    const ldScript = jsonLdScript(articleLd);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${escapeHtml(title)}</title>${ldScript}</head><body><main><h1>${escapeHtml(title)}</h1>${htmlBody}</main></body></html>`;
    fs.writeFileSync(path.join(distBlogDir, `${slug}.html`), html, 'utf-8');
    blogPosts.push({ slug, title, date: datePublished, datePublished, dateUpdated, author, excerpt, summary });
  }
}
blogPosts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(path.join(distBlogDir, 'index.json'), JSON.stringify(blogPosts), 'utf-8');

// Recipes: content/recipes/<slug>.md + <slug>.recipe.json → dist/recipes/<slug>.html and copy JSON (exclude *.summary.md)
const recipeList = [];
if (fs.existsSync(recipesDir)) {
  const mdFiles = fs.readdirSync(recipesDir).filter((f) => f.endsWith('.md') && !f.endsWith('.summary.md'));
  for (const file of mdFiles) {
    const slug = path.basename(file, '.md');
    const jsonPath = path.join(recipesDir, `${slug}.recipe.json`);
    if (!fs.existsSync(jsonPath)) continue;
    const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const mdRelPath = path.join('content', 'recipes', file);
    const gitMeta = getGitFileMeta(mdRelPath);
    const datePublished = meta.datePublished ?? meta.date ?? gitMeta.datePublished ?? '';
    const dateUpdated = meta.dateModified ?? meta.dateUpdated ?? meta.updated ?? gitMeta.dateUpdated ?? datePublished;
    const author = meta.author ?? gitMeta.author ?? '';
    const name = meta.name ?? slug;
    const rawMd = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
    const summaryPath = path.join(recipesDir, `${slug}.summary.md`);
    const summary = fs.existsSync(summaryPath) ? fs.readFileSync(summaryPath, 'utf-8').trim() : '';
    const instructionsHtml = mdToHtml(rawMd);
    const recipeLd = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name,
      datePublished: datePublished || undefined,
      dateModified: dateUpdated || undefined,
      author: author ? { '@type': 'Person', name: author } : undefined,
      url: `${baseUrl}/recipes/${slug}`,
      recipeCategory: meta.recipeCategory || undefined,
      recipeIngredient: Array.isArray(meta.recipeIngredient) ? meta.recipeIngredient : undefined,
    };
    const ldScript = jsonLdScript(recipeLd);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${escapeHtml(name)}</title>${ldScript}</head><body><main>${instructionsHtml}</main></body></html>`;
    fs.writeFileSync(path.join(distRecipesDir, `${slug}.html`), html, 'utf-8');
    const distMeta = { ...meta, datePublished, dateUpdated, author };
    fs.writeFileSync(path.join(distRecipesDir, `${slug}.recipe.json`), JSON.stringify(distMeta, null, 2), 'utf-8');
    recipeList.push({
      slug,
      name,
      recipeCategory: meta.recipeCategory,
      date: datePublished,
      datePublished,
      dateUpdated,
      author,
      summary,
    });
  }
}
fs.writeFileSync(path.join(distRecipesDir, 'index.json'), JSON.stringify(recipeList), 'utf-8');

// Combined entries (blog + recipes) for home list, most recent first
const entries = [
  ...blogPosts.map((p) => ({
    type: 'blog',
    slug: p.slug,
    title: p.title,
    date: p.date ?? '',
    datePublished: p.datePublished ?? p.date ?? '',
    dateUpdated: p.dateUpdated ?? '',
    author: p.author ?? '',
    summary: p.summary ?? '',
    href: `/blog/${p.slug}`,
  })),
  ...recipeList.map((r) => ({
    type: 'recipe',
    slug: r.slug,
    title: r.name,
    date: r.date ?? '',
    datePublished: r.datePublished ?? r.date ?? '',
    dateUpdated: r.dateUpdated ?? '',
    author: r.author ?? '',
    summary: r.summary ?? '',
    href: `/recipes/${r.slug}`,
  })),
];
entries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(path.join(distDir, 'entries.json'), JSON.stringify(entries), 'utf-8');

// RSS blog feed
const feedItems = blogPosts
  .slice(0, 50)
  .map(
    (p) =>
      `  <item><title>${escapeXml(p.title)}</title><link>${baseUrl}/blog/${p.slug}</link><guid isPermaLink="true">${baseUrl}/blog/${p.slug}</guid>${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ''}${p.author ? `<dc:creator>${escapeXml(p.author)}</dc:creator>` : ''}${p.excerpt ? `<description>${escapeXml(p.excerpt)}</description>` : ''}</item>`
  )
  .join('\n');
const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Eat Code Write — Code</title>
    <link>${baseUrl}</link>
    <description>Technical blog posts from Eat Code Write</description>
    <atom:link href="${baseUrl}/feed-code.xml" rel="self" type="application/rss+xml"/>
${feedItems}
  </channel>
</rss>`;
fs.writeFileSync(path.join(distDir, 'feed-code.xml'), feedXml, 'utf-8');
try { fs.unlinkSync(path.join(distDir, 'feed.xml')); } catch {}

// Recipes feed
const recipeFeedItems = recipeList
  .slice(0, 50)
  .map(
    (r) =>
      `  <item><title>${escapeXml(r.name)}</title><link>${baseUrl}/recipes/${r.slug}</link><guid isPermaLink="true">${baseUrl}/recipes/${r.slug}</guid>${r.date ? `<pubDate>${new Date(r.date).toUTCString()}</pubDate>` : ''}${r.author ? `<dc:creator>${escapeXml(r.author)}</dc:creator>` : ''}</item>`
  )
  .join('\n');
const recipesFeedXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Eat Code Write — Eat</title>
    <link>${baseUrl}/recipes</link>
    <description>Recipes from Eat Code Write</description>
    <atom:link href="${baseUrl}/feed-recipes.xml" rel="self" type="application/rss+xml"/>
${recipeFeedItems}
  </channel>
</rss>`;
fs.writeFileSync(path.join(distDir, 'feed-recipes.xml'), recipesFeedXml, 'utf-8');
try { fs.unlinkSync(path.join(distRecipesDir, 'feed.xml')); } catch {}

// Combined feed (code + recipes, both)
const allItems = [
  ...blogPosts.slice(0, 50).map((p) => ({ title: p.title, link: `${baseUrl}/blog/${p.slug}`, date: p.date, excerpt: p.excerpt, author: p.author })),
  ...recipeList.slice(0, 50).map((r) => ({ title: r.name, link: `${baseUrl}/recipes/${r.slug}`, date: r.date, excerpt: '', author: r.author })),
];
allItems.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const allFeedItems = allItems
  .slice(0, 50)
  .map(
    (i) =>
      `  <item><title>${escapeXml(i.title)}</title><link>${i.link}</link><guid isPermaLink="true">${i.link}</guid>${i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ''}${i.author ? `<dc:creator>${escapeXml(i.author)}</dc:creator>` : ''}${i.excerpt ? `<description>${escapeXml(i.excerpt)}</description>` : ''}</item>`
  )
  .join('\n');
const feedAllXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Eat Code Write</title>
    <link>${baseUrl}</link>
    <description>Code and recipes from Eat Code Write</description>
    <atom:link href="${baseUrl}/feed-all.xml" rel="self" type="application/rss+xml"/>
${allFeedItems}
  </channel>
</rss>`;
fs.writeFileSync(path.join(distDir, 'feed-all.xml'), feedAllXml, 'utf-8');

// Sitemap: all public URLs with optional lastmod
const sitemapUrls = [
  { loc: baseUrl + '/', lastmod: entries.length ? (entries[0].dateUpdated || entries[0].date) : null },
  ...blogPosts.map((p) => ({ loc: `${baseUrl}/blog/${p.slug}`, lastmod: p.dateUpdated || p.date })),
  ...recipeList.map((r) => ({ loc: `${baseUrl}/recipes/${r.slug}`, lastmod: r.dateUpdated || r.date })),
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) =>
      `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.split('T')[0]}</lastmod>` : ''}</url>`
  )
  .join('\n')}
</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');

// JSON index for AIs: url, title, description, type, date, summary
const indexForBots = entries.map((e) => ({
  url: baseUrl + e.href,
  title: e.title,
  description: e.summary || undefined,
  type: e.type,
  date: e.date || undefined,
  summary: e.summary || undefined,
}));
fs.writeFileSync(path.join(distDir, 'index.json'), JSON.stringify(indexForBots, null, 2), 'utf-8');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Safe for in-HTML script: escape </script> so it doesn't close the tag
function jsonLdScript(obj) {
  const json = JSON.stringify(obj);
  return '<script type="application/ld+json">' + json.replace(/<\/script>/gi, '<\\/script>') + '</script>';
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

console.log('Content build done: blog', blogPosts.length, 'recipes', recipeList.length);
