import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export type EntryFilter = 'all' | 'blog' | 'recipe';

interface Entry {
  type: 'blog' | 'recipe';
  slug: string;
  title: string;
  date: string;
  summary?: string;
  href: string;
}

function filterFromPath(pathname: string): EntryFilter {
  if (pathname === '/code') return 'blog';
  if (pathname === '/eat') return 'recipe';
  return 'all';
}

export default function EntryList() {
  const location = useLocation();
  const filter = filterFromPath(location.pathname);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/entries.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Entry[]) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);

  return (
    <div className="ecw-entry-list">
      <p className="ecw-tagline">Eat, code, write. Technical posts and recipes — a place for both.</p>
      <p className="ecw-filter-links">
        <Link to="/" className={`ecw-filter-all ${filter === 'all' ? 'ecw-filter-active' : ''}`}>All</Link>
        {' · '}
        <Link to="/code" className={`ecw-filter-code ${filter === 'blog' ? 'ecw-filter-active' : ''}`}>Code</Link>
        {' · '}
        <Link to="/eat" className={`ecw-filter-eat ${filter === 'recipe' ? 'ecw-filter-active' : ''}`}>Eat</Link>
      </p>
      {loading && <p className="ecw-loading">Loading…</p>}
      {!loading && filtered.length === 0 && <p className="ecw-empty">No entries yet.</p>}
      {!loading && filtered.length > 0 && (
        <ul className="ecw-entry-ul">
          {filtered.map((e) => (
            <li key={`${e.type}-${e.slug}`} className={`ecw-entry-item ecw-entry-item--${e.type}`}>
              <div className="ecw-entry-head">
                <Link to={e.href}>{e.title}</Link>
                <span className="ecw-entry-meta">
                  {e.type === 'blog' ? 'Code' : 'Eat'}
                  {e.date ? ` · ${e.date}` : ''}
                </span>
              </div>
              {e.summary && <p className="ecw-entry-summary">{e.summary}</p>}
            </li>
          ))}
        </ul>
      )}
      <p className="ecw-subscribe">
        <a href="/feed.xml">Subscribe to the blog feed</a>
      </p>
    </div>
  );
}
