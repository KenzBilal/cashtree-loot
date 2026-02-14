'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create a separate admin client for logging to bypass RLS if needed
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function logAction(action, targetType, targetId, metadata = {}) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('ct_session')?.value;
    
    let actorId = 'SYSTEM_AUTO';
    let actorRole = 'system';

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        actorId = user.id;
        // Fetch role
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('role')
            .eq('id', user.id)
            .single();
        actorRole = account?.role || 'user';
      }
    }

    const { error } = await supabaseAdmin.from('audit_logs').insert({
      actor_id: actorId,
      actor_role: actorRole,
      action: action.toUpperCase(),
      target_type: targetType.toUpperCase(),
      target_id: targetId,
      metadata: metadata,
      ip_address: '0.0.0.0'
    });

    if (error) console.error("Audit Log Failed:", error.message);

  } catch (err) {
    console.error("Audit System Error:", err);
  }
}