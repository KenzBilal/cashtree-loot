import { createClient } from '@supabase/supabase-js';
import SettingsForm from './SettingsForm';

export const revalidate = 0; // Always fresh data

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminSettingsPage() {
  // 1. FETCH CONFIG
  const { data: config, error } = await supabaseAdmin
    .from('system_config')
    .select('*')
    .eq('id', 1)
    .single();

  // If table is missing, show a clean error instead of crashing
  if (error || !config) {
    return (
      <div style={{padding: '40px', color: '#ef4444', border: '1px solid #333', borderRadius: '16px', background: '#0a0a0a'}}>
        <h2 style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px'}}>System Config Missing</h2>
        <p style={{fontSize: '13px', color: '#888'}}>
          Please run the SQL setup command to create the 'system_config' table.
        </p>
      </div>
    );
  }

  // --- STYLES ---
  const headerStyle = { marginBottom: '40px' };

  return (
    <div className="fade-in">
      
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: '0 0 5px 0', letterSpacing: '-1px'}}>
          System <span style={{color: '#666'}}>Control</span>
        </h1>
        <p style={{color: '#888', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px'}}>
          Global Configuration & Status
        </p>
      </div>

      {/* RENDER FORM */}
      <div style={{maxWidth: '700px'}}>
        <SettingsForm config={config} />
      </div>

    </div>
  );
}