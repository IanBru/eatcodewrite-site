import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/blog/index.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PostMeta[]) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="ecw-loading">Loading…</p>;
  if (posts.length === 0) return <p className="ecw-empty">No posts yet.</p>;

  return (
    <div className="ecw-blog-list">
      <h1>Code</h1>
      <ul className="ecw-post-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link to={`/blog/${p.slug}`}>{p.title}</Link>
            <span className="ecw-meta">{p.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
