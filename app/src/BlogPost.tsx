import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface BlogMeta {
  slug: string;
  title: string;
  date?: string;
  datePublished?: string;
  dateUpdated?: string;
  author?: string;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const base = import.meta.env.BASE_URL || '/';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [meta, setMeta] = useState<BlogMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`${base}blog/${slug}.html`).then((r) => (r.ok ? r.text() : '')),
      fetch(`${base}blog/index.json`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([text, index]: [string, BlogMeta[]]) => {
        const entry = Array.isArray(index) ? index.find((p) => p.slug === slug) : null;
        setMeta(entry ?? null);
        if (!text) {
          setHtml('');
          setLoading(false);
          return;
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const main = doc.querySelector('main') ?? doc.body;
        const h1 = main.querySelector('h1');
        setTitle(h1?.textContent ?? entry?.title ?? slug);
        if (h1) h1.remove();
        setHtml(main.innerHTML);
      })
      .catch(() => setHtml(''))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="ecw-loading">Loading…</p>;
  if (!html) return <p className="ecw-empty">Post not found.</p>;

  const pub = meta?.datePublished ?? meta?.date ?? '';
  const updated = meta?.dateUpdated ?? '';
  const showUpdated = updated && updated !== pub;

  return (
    <article className="ecw-blog-post">
      <h1>{title}</h1>
      {(meta?.author || pub || showUpdated) && (
        <p className="ecw-byline">
          {meta?.author && <span className="ecw-byline-author">{meta.author}</span>}
          {pub && (
            <span className="ecw-byline-date">
              {meta?.author ? ' · ' : ''}
              Published {formatDate(pub)}
            </span>
          )}
          {showUpdated && <span className="ecw-byline-date"> · Updated {formatDate(updated)}</span>}
        </p>
      )}
      <div className="ecw-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
