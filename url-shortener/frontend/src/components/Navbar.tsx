import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1.5rem', background: '#111', color: '#fff',
    }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem' }}>
        Snip
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: '#ccc', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '0.3rem 0.75rem', borderRadius: 4, cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#ccc', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{
              background: '#3b82f6', color: '#fff', padding: '0.3rem 0.75rem',
              borderRadius: 4, textDecoration: 'none',
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
