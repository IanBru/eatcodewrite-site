import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import BlogList from './BlogList';
import BlogPost from './BlogPost';
import RecipeList from './RecipeList';
import RecipePage from './RecipePage';

export default function App() {
  return (
    <div className="ecw-layout">
      <header className="ecw-header">
        <Link to="/" className="ecw-logo">Eat Code Write</Link>
        <nav className="ecw-nav">
          <Link to="/">Home</Link>
          <Link to="/blog">Code</Link>
          <Link to="/recipes">Eat</Link>
          <a href="/feed.xml" className="ecw-feed-link" title="RSS feed">Feed</a>
        </nav>
      </header>
      <main className="ecw-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/:slug" element={<RecipePage />} />
        </Routes>
      </main>
      <footer className="ecw-footer">
        <p>Eat Code Write — technical notes and recipes.</p>
      </footer>
    </div>
  );
}
