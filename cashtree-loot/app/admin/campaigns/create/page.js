import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateForm from './CreateForm';

export const metadata = {
  title: 'Deploy New Mission | Admin',
};

export default function CreateCampaignPage() {
  return (
    <div>

      {/* ── HEADER ── */}
      <div style={{
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        <Link
          href="/admin/campaigns"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#111',
            border: '1px solid #222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'border-color 0.2s, color 0.2s',
          }}
          aria-label="Back to campaigns"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: '900',
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.8px',
          }}>
            Deploy <span style={{ color: '#444' }}>Mission</span>
          </h1>
          <p style={{
            color: '#444',
            fontSize: '11px',
            marginTop: '4px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Configure New Offer Parameters
          </p>
        </div>
      </div>

      {/* ── FORM ── */}
      <CreateForm />

    </div>
  );
}