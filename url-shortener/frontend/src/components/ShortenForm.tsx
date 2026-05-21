import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Result {
  shortUrl: string;
  slug: string;
}

export default function ShortenForm() {
  const { user } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/urls', {
        longUrl,
        ...(customSlug && { slug: customSlug }),
        ...(expiresAt && { expiresAt: new Date(expiresAt).toISOString() }),
      });
      setResult(data);
      setLongUrl('');
      setCustomSlug('');
      setExpiresAt('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="url"
          placeholder="https://example.com/your-long-url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          style={inputStyle}
        />
        {user && (
          <>
            <input
              type="text"
              placeholder="Custom slug (optional, e.g. my-link)"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              style={inputStyle}
            />
            <input
              type="datetime-local"
              title="Expiry date/time (optional)"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={inputStyle}
            />
          </>
        )}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Shortening…' : 'Shorten'}
        </button>
      </form>

      {error && <p style={{ color: '#ef4444', marginTop: '0.75rem' }}>{error}</p>}

      {result && (
        <div style={{
          marginTop: '1.25rem', padding: '1rem', background: '#f0fdf4',
          border: '1px solid #86efac', borderRadius: 8,
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Your short link:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <a href={result.shortUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#16a34a', wordBreak: 'break-all' }}>
              {result.shortUrl}
            </a>
            <button onClick={copy} style={{ ...btnStyle, padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.9rem', fontSize: '1rem', border: '1px solid #d1d5db',
  borderRadius: 6, outline: 'none', width: '100%', boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  padding: '0.65rem 1.25rem', background: '#3b82f6', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
};
