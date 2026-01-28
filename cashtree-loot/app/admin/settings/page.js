import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminSettings() {
  // 1. FETCH SETTINGS (Row ID 1)
  const { data: config, error } = await supabaseAdmin
    .from('system_config')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !config) {
    return (
      <div style={{padding: '40px', color: '#ef4444'}}>
        <h2>Database Error</h2>
        <p>Could not find the 'system_config' table or Row ID 1.</p>
        <p>Please run the SQL command provided in Step 1.</p>
      </div>
    );
  }

  // 2. SERVER ACTION: SAVE CHANGES
  async function updateConfig(formData) {
    'use server';
    
    const updates = {
      maintenance_mode: formData.get('maintenance') === 'on',
      min_withdrawal: parseFloat(formData.get('min_w')) || 500,
      support_whatsapp: formData.get('whatsapp'),
      notice_board: formData.get('notice'),
    };

    const { error: updateError } = await supabaseAdmin
      .from('system_config')
      .update(updates)
      .eq('id', 1);

    if (updateError) {
      console.error("Save failed:", updateError);
    } else {
      revalidatePath('/admin/settings');
    }
  }

  // --- STYLES ---
  const containerStyle = { maxWidth: '700px' };
  const cardStyle = { background: '#0a0a0a', border: '1px solid #222', borderRadius: '24px', padding: '30px' };
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' };
  const inputStyle = { width: '100%', background: '#000', border: '1px solid #222', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', outline: 'none' };
  
  return (
    <div style={containerStyle}>
      <h1 style={{fontSize: '28px', fontWeight: '900', marginBottom: '10px'}}>System Control</h1>
      <p style={{color: '#666', marginBottom: '30px'}}>Manage global settings for the platform.</p>

      <form action={updateConfig} style={cardStyle}>
        
        {/* MAINTENANCE MODE */}
        <div style={{
          marginBottom: '30px', 
          padding: '20px', 
          background: config.maintenance_mode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
          border: config.maintenance_mode ? '1px solid #7f1d1d' : '1px solid #14532d',
          borderRadius: '16px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div>
            <div style={{fontWeight: 'bold', color: config.maintenance_mode ? '#f87171' : '#4ade80'}}>
              Maintenance Mode: {config.maintenance_mode ? 'ON' : 'OFF'}
            </div>
            <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
              {config.maintenance_mode ? 'Users CANNOT access dashboard.' : 'System is live.'}
            </div>
          </div>
          <input 
            type="checkbox" 
            name="maintenance" 
            defaultChecked={config.maintenance_mode} 
            style={{width: '24px', height: '24px', cursor: 'pointer', accentColor: '#ef4444'}} 
          />
        </div>

        {/* INPUTS GRID */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
          <div>
            <label style={labelStyle}>Min Withdrawal (₹)</label>
            <input name="min_w" type="number" defaultValue={config.min_withdrawal} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp Support</label>
            <input name="whatsapp" type="text" defaultValue={config.support_whatsapp} placeholder="+91..." style={inputStyle} />
          </div>
        </div>

        {/* NOTICE BOARD */}
        <div style={{marginBottom: '30px'}}>
          <label style={labelStyle}>Dashboard Notice</label>
          <textarea 
            name="notice" 
            defaultValue={config.notice_board} 
            rows="3" 
            style={{...inputStyle, resize: 'none', fontFamily: 'sans-serif'}} 
            placeholder="e.g. Payments will be processed by 6 PM..."
          />
        </div>

        {/* SAVE BUTTON */}
        <button type="submit" style={{
          width: '100%', 
          padding: '16px', 
          background: '#fff', 
          color: '#000', 
          border: 'none', 
          borderRadius: '12px', 
          fontWeight: '800', 
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: 'pointer'
        }}>
          Save Changes
        </button>

      </form>
    </div>
  );
}