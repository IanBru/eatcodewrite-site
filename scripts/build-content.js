#!/usr/bin/env node
/**
 * Build content: blog (markdown→HTML), recipes (markdown+JSON→HTML), RSS feeds.
 * Writes to dist/ and copies public/ into dist/.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

const blogDir = path.join(contentDir, 'blog');
const recipesDir = path.join(contentDir, 'recipes');
const distBlogDir = path.join(distDir, 'blog');
const distRecipesDir = path.join(distDir, 'recipes');

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

// Simple front matter parse (--- ... --- then body)
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { front: {}, body: content };
  const front = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) front[m[1]] = m[2].trim();
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

// Blog: content/blog/*.md → dist/blog/<slug>.html + index.json
const blogPosts = [];
if (fs.existsSync(blogDir)) {
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const slug = path.basename(file, '.md');
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { front, body } = parseFrontMatter(raw);
    const title = front.title ?? slug;
    const date = front.date ?? '';
    const excerpt = front.excerpt ?? '';
    const htmlBody = mdToHtml(body);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${escapeHtml(title)}</title></head><body><main><h1>${escapeHtml(title)}</h1>${htmlBody}</main></body></html>`;
    fs.writeFileSync(path.join(distBlogDir, `${slug}.html`), html, 'utf-8');
    blogPosts.push({ slug, title, date, excerpt });
  }
}
blogPosts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(path.join(distBlogDir, 'index.json'), JSON.stringify(blogPosts), 'utf-8');

// Recipes: content/recipes/<slug>.md + <slug>.recipe.json → dist/recipes/<slug>.html and copy JSON
const recipeList = [];
if (fs.existsSync(recipesDir)) {
  const mdFiles = fs.readdirSync(recipesDir).filter((f) => f.endsWith('.md'));
  for (const file of mdFiles) {
    const slug = path.basename(file, '.md');
    const jsonPath = path.join(recipesDir, `${slug}.recipe.json`);
    if (!fs.existsSync(jsonPath)) continue;
    const rawMd = fs.readFileSync(path.join(recipesDir, file), 'utf-8');
    const instructionsHtml = mdToHtml(rawMd);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head><body><main>${instructionsHtml}</main></body></html>`;
    fs.writeFileSync(path.join(distRecipesDir, `${slug}.html`), html, 'utf-8');
    fs.copyFileSync(jsonPath, path.join(distRecipesDir, `${slug}.recipe.json`));
    const meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    recipeList.push({
      slug,
      name: meta.name ?? slug,
      recipeCategory: meta.recipeCategory,
    });
  }
}
fs.writeFileSync(path.join(distRecipesDir, 'index.json'), JSON.stringify(recipeList), 'utf-8');

// RSS blog feed
const baseUrl = process.env.SITE_BASE_URL || 'https://www.eatcodewrite.com';
const feedItems = blogPosts
  .slice(0, 50)
  .map(
    (p) =>
      `  <item><title>${escapeXml(p.title)}</title><link>${baseUrl}/blog/${p.slug}</link><guid isPermaLink="true">${baseUrl}/blog/${p.slug}</guid>${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ''}${p.excerpt ? `<description>${escapeXml(p.excerpt)}</description>` : ''}</item>`
  )
  .join('\n');
const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eat Code Write — Code</title>
    <link>${baseUrl}</link>
    <description>Technical blog posts from Eat Code Write</description>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${feedItems}
  </channel>
</rss>`;
fs.writeFileSync(path.join(distDir, 'feed.xml'), feedXml, 'utf-8');

// Optional recipes feed
const recipeFeedItems = recipeList
  .slice(0, 50)
  .map(
    (r) =>
      `  <item><title>${escapeXml(r.name)}</title><link>${baseUrl}/recipes/${r.slug}</link><guid isPermaLink="true">${baseUrl}/recipes/${r.slug}</guid></item>`
  )
  .join('\n');
const recipesFeedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eat Code Write — Eat</title>
    <link>${baseUrl}/recipes</link>
    <description>Recipes from Eat Code Write</description>
    <atom:link href="${baseUrl}/recipes/feed.xml" rel="self" type="application/rss+xml"/>
${recipeFeedItems}
  </channel>
</rss>`;
fs.writeFileSync(path.join(distRecipesDir, 'feed.xml'), recipesFeedXml, 'utf-8');

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
