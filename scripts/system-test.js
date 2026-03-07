#!/usr/bin/env node
/**
 * System tests: parse all generated HTML in dist/ and verify
 * - no broken images (internal src exists)
 * - no broken internal links (target exists or is SPA route)
 * - all external links have a target attribute
 * Run after build: npm run build && npm run test:system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const SITE_ORIGIN = process.env.SITE_BASE_URL || 'https://www.eatcodewrite.com';

function resolveInternalPath(href) {
  const u = href.replace(/^#.*$/, '').split('?')[0].trim();
  if (!u || u === '') return '/';
  if (u.startsWith('http://') || u.startsWith('https://')) return null;
  return u.startsWith('/') ? u : `/${u}`;
}

function internalPathToDistFile(internalPath) {
  if (internalPath === '/' || internalPath === '/code' || internalPath === '/eat' || internalPath === '/blog' || internalPath === '/recipes')
    return path.join(distDir, 'index.html');
  if (internalPath.startsWith('/blog/')) {
    const slug = internalPath.slice(7).replace(/\/$/, '');
    return slug ? path.join(distDir, 'blog', `${slug}.html`) : path.join(distDir, 'index.html');
  }
  if (internalPath.startsWith('/recipes/')) {
    const slug = internalPath.slice(9).replace(/\/$/, '');
    return slug ? path.join(distDir, 'recipes', `${slug}.html`) : path.join(distDir, 'index.html');
  }
  return path.join(distDir, internalPath.slice(1));
}

function isExternal(href) {
  if (!href || href.startsWith('#') || href.startsWith('/')) return false;
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      const url = new URL(href);
      return url.origin !== new URL(SITE_ORIGIN).origin;
    } catch {
      return true;
    }
  }
  return false;
}

function collectHtmlFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) collectHtmlFiles(p, list);
    else if (name.endsWith('.html')) list.push(p);
  }
  return list;
}

let failed = false;
const errors = [];

const htmlFiles = collectHtmlFiles(distDir);
if (htmlFiles.length === 0) {
  console.error('No HTML files in dist/. Run npm run build first.');
  process.exit(1);
}

for (const filePath of htmlFiles) {
  const relPath = path.relative(distDir, filePath);
  const dir = path.dirname(filePath);
  const baseDirRel = path.relative(distDir, dir) || '.';
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = load(html, { decodeEntities: true });

  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const resolved = resolveInternalPath(src);
    if (resolved === null) return; // external image
    const distFile = src.startsWith('/')
      ? path.join(distDir, src.slice(1))
      : path.join(distDir, baseDirRel, src);
    if (!fs.existsSync(distFile)) {
      failed = true;
      errors.push(`${relPath}: broken image src="${src}" (resolved ${distFile})`);
    }
  });

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#')) return;
    if (isExternal(href)) {
      const target = $(el).attr('target');
      if (!target) {
        failed = true;
        errors.push(`${relPath}: external link without target: ${href}`);
      }
      return;
    }
    const internalPath = resolveInternalPath(href);
    if (internalPath === null) return;
    const distFile = internalPathToDistFile(internalPath);
    if (!fs.existsSync(distFile)) {
      failed = true;
      errors.push(`${relPath}: broken internal link href="${href}" (resolved ${path.relative(rootDir, distFile)})`);
    }
  });
}

if (errors.length) {
  console.error('System test failures:\n' + errors.join('\n'));
}
if (failed) {
  process.exit(1);
}
console.log(`System tests passed (${htmlFiles.length} HTML files checked).`);
