import { Routes, Route } from 'react-router-dom';
import EntryList from './EntryList';
import BlogPost from './BlogPost';
import RecipePage from './RecipePage';
import NotFound from './NotFound';

export default function App() {
  return (
    <div className="ecw-layout">
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
