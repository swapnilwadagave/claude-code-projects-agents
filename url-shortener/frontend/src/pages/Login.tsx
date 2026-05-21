import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Log in</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          required style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          required style={inputStyle} />
        {error && <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: '#6b7280' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.9rem', fontSize: '1rem', border: '1px solid #d1d5db',
  borderRadius: 6, outline: 'none', width: '100%', boxSizing: 'border-box',
};
const btnStyle: React.CSSProperties = {
  padding: '0.65rem', background: '#3b82f6', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
};
