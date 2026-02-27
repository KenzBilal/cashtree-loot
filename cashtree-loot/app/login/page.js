'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Use proxy URL so mobile ISPs blocking supabase.co still work
const supabaseUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/api/supabase`
  : process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginDebug() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const log = (msg, color = '#fff') => {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, { msg, color, time }]);
  };

  const handleLogin = async () => {
    setLogs([]);
    setLoading(true);

    try {
      log(`Supabase URL being used: ${supabaseUrl}`, process.env.NEXT_PUBLIC_SUPABASE_URL ? '#00ff88' : '#ff4444');
      log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20) + '...' : 'UNDEFINED ❌'}`, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '#00ff88' : '#ff4444');

      let email = username.trim();
      log(`Input username: "${email}"`, '#aaa');

      if (!email.includes('@')) {
        log(`Username mode — calling RPC get_email_for_username...`, '#ffcc00');
        try {
          const rpcPromise = supabase.rpc('get_email_for_username', { p_username: email });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout after 3s')), 3000));
          const { data: recoveryEmail, error: rpcError } = await Promise.race([rpcPromise, timeoutPromise]);

          if (rpcError) {
            log(`RPC error: ${rpcError.message}`, '#ff4444');
            email = `${email.toUpperCase()}@cashttree.internal`;
            log(`Fallback to: ${email}`, '#ffcc00');
          } else {
            log(`RPC returned: "${recoveryEmail}"`, '#00ff88');
            email = recoveryEmail || `${email.toUpperCase()}@cashttree.internal`;
            log(`Using email: ${email}`, '#00ff88');
          }
        } catch (e) {
          log(`RPC failed/timeout: ${e.message}`, '#ff4444');
          email = `${email.toUpperCase()}@cashttree.internal`;
          log(`Fallback to: ${email}`, '#ffcc00');
        }
      } else {
        log(`Email mode — using directly: ${email}`, '#aaa');
      }

      log(`Calling supabase.auth.signInWithPassword...`, '#ffcc00');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password,
      });

      if (authError) {
        log(`AUTH FAILED: ${authError.message} (status: ${authError.status})`, '#ff4444');
        log(`Error code: ${authError.code || 'none'}`, '#ff4444');
        setLoading(false);
        return;
      }

      log(`AUTH SUCCESS ✅ user_id: ${data.user.id}`, '#00ff88');
      log(`Session access_token: ${data.session.access_token.slice(0, 30)}...`, '#00ff88');

      log(`Fetching accounts row...`, '#ffcc00');
      const { data: account, error: roleError } = await supabase
        .from('accounts')
        .select('role, is_frozen, username')
        .eq('id', data.user.id)
        .single();

      if (roleError) {
        log(`Accounts fetch error: ${roleError.message}`, '#ff4444');
        setLoading(false);
        return;
      }

      log(`Account: role=${account.role}, frozen=${account.is_frozen}, username=${account.username}`, '#00ff88');

      log(`Calling /api/auth/session POST...`, '#ffcc00');
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
      const sessionData = await sessionRes.json();
      log(`Session API response (${sessionRes.status}): ${JSON.stringify(sessionData)}`, sessionRes.ok ? '#00ff88' : '#ff4444');

      log(`All done! Would redirect to: /${account.role === 'admin' ? 'admin' : 'dashboard'}`, '#00ff88');
      log(`NOT redirecting — this is debug mode`, '#ffcc00');

    } catch (err) {
      log(`UNCAUGHT ERROR: ${err.message}`, '#ff4444');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '20px', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#00ff88', marginBottom: '20px' }}>🔍 Login Debug Page</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginBottom: '20px' }}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username or email"
          autoCapitalize="none"
          autoCorrect="off"
          style={{ padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px', fontSize: '16px' }}
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="text"
          autoCapitalize="none"
          autoCorrect="off"
          style={{ padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px', fontSize: '16px' }}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ padding: '14px', background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}
        >
          {loading ? 'Running...' : 'TEST LOGIN'}
        </button>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '16px', maxWidth: '600px', maxHeight: '60vh', overflowY: 'auto' }}>
        {logs.length === 0 && <div style={{ color: '#444' }}>Logs will appear here...</div>}
        {logs.map((l, i) => (
          <div key={i} style={{ color: l.color, fontSize: '12px', marginBottom: '4px', wordBreak: 'break-all' }}>
            <span style={{ color: '#555' }}>[{l.time}] </span>{l.msg}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', color: '#444', fontSize: '11px' }}>
        Password shown in plain text • No redirect • Safe for testing
      </div>
    </div>
  );
}