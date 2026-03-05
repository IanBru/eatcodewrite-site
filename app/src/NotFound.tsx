import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="ecw-not-found">
      <h1>Page not found</h1>
      <p>That page doesn’t exist. <Link to="/">Go home</Link> or try <Link to="/code">Code</Link> or <Link to="/eat">Eat</Link>.</p>
    </div>
  );
}
