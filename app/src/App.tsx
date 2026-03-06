import { Link, Routes, Route } from 'react-router-dom';
import EntryList from './EntryList';
import BlogPost from './BlogPost';
import RecipePage from './RecipePage';
import NotFound from './NotFound';

export default function App() {
  return (
    <div className="ecw-layout">
      <header className="ecw-header">
        <Link to="/" className="ecw-site-logo-link" aria-label="Eat Code Write home">
          <img src="/Logo.png" alt="" className="ecw-site-logo" width="160" height="48" />
        </Link>
      </header>
      <main className="ecw-main">
        <Routes>
          <Route path="/" element={<EntryList />} />
          <Route path="/code" element={<EntryList />} />
          <Route path="/eat" element={<EntryList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/recipes/:slug" element={<RecipePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="ecw-footer">
        <p>Eat Code Write — technical notes and recipes.</p>
      </footer>
    </div>
  );
}
