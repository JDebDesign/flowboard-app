import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <main id="main" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p>
        <Link to="/boards">Go to your boards</Link>
      </p>
    </main>
  );
}
