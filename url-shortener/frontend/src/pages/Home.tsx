import ShortenForm from '../components/ShortenForm';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Shorten any URL instantly</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Paste a long link below to get a short, shareable URL.
        {!user && (
          <> <Link to="/register">Create a free account</Link> to manage links, set custom slugs, and see analytics.</>
        )}
      </p>
      <ShortenForm />
    </div>
  );
}
