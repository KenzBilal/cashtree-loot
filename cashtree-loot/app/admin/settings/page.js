import { createClient } from '@supabase/supabase-js';
import SettingsForm from './SettingsForm';
import { Settings, Sliders } from 'lucide-react';

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
      <div style={{ padding: '40px', color: '#ef4444', background: '#0a0a0f', border: '1px solid #333', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Configuration Error</h3>
        <p style={{ fontSize: '13px', color: '#888' }}>Database table 'system_config' not found. Please run the setup SQL.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: 'white', minHeight: '100vh', padding: '40px', background: '#050505' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '40px', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Settings color="#fff" /> System Settings
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Configure global parameters, maintenance mode, and support channels.
        </p>
      </div>

      {/* FORM */}
      <SettingsForm config={config} />

    </div>
  );
}