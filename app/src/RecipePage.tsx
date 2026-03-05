import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface RecipeData {
  name: string;
  recipeIngredient?: string[];
  recipeYield?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeCategory?: string;
  recipeCuisine?: string;
  [key: string]: unknown;
}

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [instructionsHtml, setInstructionsHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/recipes/${slug}.recipe.json`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/recipes/${slug}.html`).then((r) => (r.ok ? r.text() : '')),
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

  return (
    <article className="ecw-recipe">
      <h1>{recipe.name}</h1>
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
    </article>
  );
}
