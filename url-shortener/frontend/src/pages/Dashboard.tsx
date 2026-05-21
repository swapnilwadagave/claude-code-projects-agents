import { useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import LinkCard from '../components/LinkCard';
import ShortenForm from '../components/ShortenForm';

interface UrlEntry {
  id: string;
  slug: string;
  shortUrl: string;
  longUrl: string;
  clicks: number;
  expiresAt: string | null;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUrls = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/urls?page=${p}&limit=20`);
      setUrls(data.data);
      setMeta(data.meta);
    } catch {
      setError('Failed to load your links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(page); }, [fetchUrls, page]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this link?')) return;
    await api.delete(`/urls/${id}`);
    fetchUrls(page);
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Your links</h2>

      <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Create new link</h3>
        <ShortenForm />
      </div>

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      {loading && <p style={{ color: '#6b7280' }}>Loading…</p>}

      {!loading && urls.length === 0 && (
        <p style={{ color: '#6b7280' }}>No links yet. Create one above!</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {urls.map((u) => (
          <LinkCard key={u.id} {...u} onDelete={handleDelete} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} style={pageBtn}>Prev</button>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page === meta.totalPages} style={pageBtn}>Next</button>
        </div>
      )}
    </div>
  );
}

const pageBtn: React.CSSProperties = {
  padding: '0.4rem 0.9rem', border: '1px solid #d1d5db', borderRadius: 4,
  cursor: 'pointer', background: '#fff',
};
