import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatDistanceToNow } from 'date-fns';

interface LinkCardProps {
  id: string;
  slug: string;
  shortUrl: string;
  longUrl: string;
  clicks: number;
  expiresAt: string | null;
  createdAt: string;
  onDelete: (id: string) => void;
}

export default function LinkCard({ id, shortUrl, longUrl, clicks, expiresAt, createdAt, onDelete }: LinkCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const expired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      opacity: expired ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ minWidth: 0 }}>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontWeight: 600, color: '#3b82f6', wordBreak: 'break-all' }}>
            {shortUrl}
          </a>
          <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.85rem', wordBreak: 'break-all' }}>
            {longUrl.length > 80 ? longUrl.slice(0, 80) + '…' : longUrl}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
          <button onClick={copy} style={smallBtn}>{copied ? '✓' : 'Copy'}</button>
          <button onClick={() => setShowQR(!showQR)} style={smallBtn}>QR</button>
          <button onClick={() => onDelete(id)} style={{ ...smallBtn, color: '#ef4444' }}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#6b7280' }}>
        <span>Clicks: <strong style={{ color: '#111' }}>{clicks}</strong></span>
        <span>Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        {expiresAt && (
          <span style={{ color: expired ? '#ef4444' : '#f59e0b' }}>
            {expired ? 'Expired' : `Expires ${formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}`}
          </span>
        )}
      </div>

      {showQR && (
        <div style={{ marginTop: '0.5rem', display: 'inline-block' }}>
          <QRCodeSVG value={shortUrl} size={128} />
        </div>
      )}
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  padding: '0.25rem 0.6rem', fontSize: '0.8rem', border: '1px solid #d1d5db',
  borderRadius: 4, cursor: 'pointer', background: '#fff',
};
