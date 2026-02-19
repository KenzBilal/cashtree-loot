import { createClient } from '@supabase/supabase-js';
import SettingsForm from './SettingsForm';
import { Settings } from 'lucide-react';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminSettingsPage() {
  const { data: config, error } = await supabaseAdmin
    .from('system_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !config) {
    return (
      <div style={{
        padding: '24px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px',
        color: '#ef4444',
      }}>
        <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>Configuration Error</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Database table 'system_config' not found. Please run the setup SQL.
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '100px' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '20px',
        marginBottom: '28px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: '900', color: '#fff',
            margin: '0 0 4px 0', letterSpacing: '-0.8px',
          }}>
            System <span style={{ color: '#444' }}>Settings</span>
          </h1>
          <p style={{
            margin: 0, fontSize: '11px', fontWeight: '700',
            color: '#444', textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            Global configuration &amp; controls
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px',
          background: config.maintenance_mode ? 'rgba(239,68,68,0.06)' : 'rgba(0,255,136,0.06)',
          border: `1px solid ${config.maintenance_mode ? 'rgba(239,68,68,0.2)' : 'rgba(0,255,136,0.2)'}`,
          borderRadius: '20px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: config.maintenance_mode ? '#ef4444' : '#00ff88',
            boxShadow: `0 0 6px ${config.maintenance_mode ? '#ef4444' : '#00ff88'}`,
          }} />
          <span style={{
            fontSize: '10px', fontWeight: '800',
            color: config.maintenance_mode ? '#ef4444' : '#00ff88',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            {config.maintenance_mode ? 'Maintenance' : 'Live'}
          </span>
        </div>
      </div>

      {/* ── FORM ── */}
      <SettingsForm config={config} />
    </div>
  );
}