import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export type EntryFilter = 'all' | 'blog' | 'recipe';

interface Entry {
  type: 'blog' | 'recipe';
  slug: string;
  title: string;
  date: string;
  datePublished?: string;
  author?: string;
  summary?: string;
  href: string;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
              <Link to={e.href} className="ecw-entry-link">
                <div className="ecw-entry-head">
                  <span className="ecw-entry-title">{e.title}</span>
                  <span className="ecw-entry-meta">
                    {e.type === 'blog' ? (
                      <img src="/Logo-Code.png" alt="" className="ecw-entry-type-icon" width="16" height="16" />
                    ) : (
                      <img src="/Logo-Eat.png" alt="" className="ecw-entry-type-icon" width="16" height="16" />
                    )}
                    {e.type === 'blog' ? ' Code' : ' Eat'}
                    {e.date ? ` · ${e.date}` : ''}
                  </span>
                </div>
                {e.summary && <p className="ecw-entry-summary">{e.summary}</p>}
                {(e.author || (e.datePublished ?? e.date)) && (
                  <p className="ecw-entry-byline">
                    {[e.author, formatDate(e.datePublished ?? e.date)].filter(Boolean).join(' · ')}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className={`ecw-subscribe ecw-subscribe--${filter}`}>
        {filter === 'all' && <a href="/feed-all.xml">Subscribe to feed (code and recipes)</a>}
        {filter === 'blog' && <a href="/feed.xml">Subscribe to code feed</a>}
        {filter === 'recipe' && <a href="/recipes/feed.xml">Subscribe to recipes feed</a>}
      </p>
    </div>
  );
}
