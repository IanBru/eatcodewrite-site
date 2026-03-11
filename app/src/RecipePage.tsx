import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ShareLinks from './ShareLinks';

interface RecipeData {
  name: string;
  author?: string;
  datePublished?: string;
  dateUpdated?: string;
  recipeIngredient?: string[];
  recipeYield?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  [key: string]: unknown;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const base = import.meta.env.BASE_URL || '/';

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [instructionsHtml, setInstructionsHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`${base}recipes/${slug}.recipe.json`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}recipes/${slug}.html`).then((r) => (r.ok ? r.text() : '')),
    ])
      .then(([data, html]) => {
        setRecipe(data ?? null);
        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const main = doc.querySelector('main') ?? doc.body;
          setInstructionsHtml(main.innerHTML);
        } else {
          setInstructionsHtml('');
        }
      })
      .catch(() => {
        setRecipe(null);
        setInstructionsHtml('');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="ecw-loading">Loading…</p>;
  if (!recipe) return <p className="ecw-empty">Recipe not found.</p>;

  const times: string[] = [];
  if (recipe.prepTime) times.push(`Prep: ${recipe.prepTime}`);
  if (recipe.cookTime) times.push(`Cook: ${recipe.cookTime}`);
  if (recipe.totalTime) times.push(`Total: ${recipe.totalTime}`);

  const pub = recipe.datePublished ?? '';
  const updated = recipe.dateUpdated ?? '';
  const showUpdated = updated && updated !== pub;

  return (
    <article className="ecw-recipe">
      <h1>{recipe.name}</h1>
      {(recipe.author || pub || showUpdated) && (
        <p className="ecw-byline">
          {recipe.author && <span className="ecw-byline-author">{recipe.author}</span>}
          {pub && (
            <span className="ecw-byline-date">
              {recipe.author ? ' · ' : ''}
              Published {formatDate(pub)}
            </span>
          )}
          {showUpdated && <span className="ecw-byline-date"> · Updated {formatDate(updated)}</span>}
        </p>
      )}
      <div className="ecw-recipe-meta">
        {recipe.recipeCategory && <span>{recipe.recipeCategory}</span>}
        {recipe.recipeCuisine && <span>{recipe.recipeCuisine}</span>}
        {recipe.recipeYield && <span>Serves {recipe.recipeYield}</span>}
        {times.length > 0 && <span>{times.join(' · ')}</span>}
      </div>
      {recipe.recipeIngredient && recipe.recipeIngredient.length > 0 && (
        <section className="ecw-recipe-ingredients">
          <h2>Ingredients</h2>
          <ul>
            {recipe.recipeIngredient.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </section>
      )}
      {instructionsHtml && (
        <section className="ecw-recipe-instructions">
          <h2>Instructions</h2>
          <div className="ecw-prose" dangerouslySetInnerHTML={{ __html: instructionsHtml }} />
        </section>
      )}
      <ShareLinks
        url={typeof window !== 'undefined' ? window.location.origin + location.pathname : ''}
        title={recipe.name}
        type="recipe"
      />
    </article>
  );
}
