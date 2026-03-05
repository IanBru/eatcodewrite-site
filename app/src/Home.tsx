export default function Home() {
  return (
    <div className="ecw-home">
      <p className="ecw-tagline">
        Eat, code, write. Technical posts and recipes — a place for both.
      </p>
      <section className="ecw-home-links">
        <a href="/blog" className="ecw-card">
          <h2>Code</h2>
          <p>Technical blog posts and notes.</p>
        </a>
        <a href="/recipes" className="ecw-card">
          <h2>Eat</h2>
          <p>Recipes with ingredients and instructions.</p>
        </a>
      </section>
      <p className="ecw-subscribe">
        <a href="/feed.xml">Subscribe to the blog feed</a>
      </p>
    </div>
  );
}
