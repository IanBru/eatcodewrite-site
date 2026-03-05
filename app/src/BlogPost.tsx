import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/blog/${slug}.html`)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        if (!text) {
          setHtml('');
          setLoading(false);
          return;
        }
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const main = doc.querySelector('main') ?? doc.body;
        const h1 = doc.querySelector('h1');
        setTitle(h1?.textContent ?? slug);
        setHtml(main.innerHTML);
      })
      .catch(() => setHtml(''))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="ecw-loading">Loading…</p>;
  if (!html) return <p className="ecw-empty">Post not found.</p>;

  return (
    <article className="ecw-blog-post">
      <h1>{title}</h1>
      <div className="ecw-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
