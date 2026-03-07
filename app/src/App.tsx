import { Link, Routes, Route, useLocation } from 'react-router-dom';
import EntryList from './EntryList';
import BlogPost from './BlogPost';
import RecipePage from './RecipePage';
import NotFound from './NotFound';

function pageTypeFromPath(pathname: string): 'all' | 'code' | 'eat' {
  if (pathname === '/code' || pathname.startsWith('/blog/')) return 'code';
  if (pathname === '/eat' || pathname.startsWith('/recipes/')) return 'eat';
  return 'all';
}

function Header() {
  const { pathname } = useLocation();
  const pageType = pageTypeFromPath(pathname);
  const logoSrc = pageType === 'code' ? '/Logo-Code.png' : pageType === 'eat' ? '/Logo-Eat.png' : '/Logo.png';

  return (
    <header className={`ecw-header ecw-header--${pageType}`}>
      <Link to="/" className="ecw-site-logo-link" aria-label="Eat Code Write home">
        <img src={logoSrc} alt="" className="ecw-site-logo" width="160" height="48" />
      </Link>
      <p className="ecw-brand">
        Just a place for{' '}
        <a href="https://copperberry.com/#ian" target="copperberry" rel="noopener noreferrer" className="ecw-brand-link">Ian</a>
        {' '}to jot down random thoughts about software development — and food!
      </p>
    </header>
  );
}

export default function App() {
  return (
    <div className="ecw-layout">
      <Header />
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
        <p>eatcodewrite is a <a href="https://copperberry.com" target="copperberry" rel="noopener noreferrer" className="ecw-footer-copperberry">copperberry</a> site.</p>
      </footer>
    </div>
  );
}
