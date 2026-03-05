import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface RecipeMeta {
  slug: string;
  name: string;
  recipeCategory?: string;
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<RecipeMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/recipes/index.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: RecipeMeta[]) => {
        setRecipes(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="ecw-loading">Loading…</p>;
  if (recipes.length === 0) return <p className="ecw-empty">No recipes yet.</p>;

  return (
    <div className="ecw-recipe-list">
      <h1>Eat</h1>
      <ul className="ecw-recipe-list-ul">
        {recipes.map((r) => (
          <li key={r.slug}>
            <Link to={`/recipes/${r.slug}`}>{r.name}</Link>
            {r.recipeCategory && <span className="ecw-meta">{r.recipeCategory}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
