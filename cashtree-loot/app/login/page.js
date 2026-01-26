'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw new Error("Invalid credentials. Please try again.");

      // 2. Check Role
      const { data: account, error: roleError } = await supabase
        .from('accounts')
        .select('role, is_frozen')
        .eq('id', data.user.id)
        .single();

      if (roleError || !account) throw new Error("Account setup missing.");
      if (account.is_frozen) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Account is Frozen.");
      }

      // 3. Cookie & Redirect
      document.cookie = `ct_session=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax; Secure`;

      if (account.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // --- STYLES ---
  const wrapperStyle = {
    minHeight: '100vh',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'var(--bg-1)',
    padding: '20px'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '40px 30px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: 'var(--bg-1)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px'
  };

  const btnStyle = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
    color: '#022c22',
    fontWeight: '800',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle} className="animate-fade-in">
        
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={{fontSize: '32px', fontWeight: '900', letterSpacing: '-1px'}}>
            Cash<span style={{color: 'var(--accent)'}}>Tree</span>
          </div>
          <p style={{color: 'var(--muted)', fontSize: '13px', marginTop: '5px'}}>
            Secure Partner Portal
          </p>
        </div>

        {error && (
          <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{marginBottom: '5px'}}>
            <label style={{fontSize:'11px', fontWeight:'700', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginLeft:'4px'}}>Email / ID</label>
          </div>
          <input 
            type="email" 
            required
            style={inputStyle}
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <div style={{marginBottom: '5px'}}>
            <label style={{fontSize:'11px', fontWeight:'700', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginLeft:'4px'}}>Password</label>
          </div>
          <input 
            type="password" 
            required
            style={inputStyle}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <div style={{marginTop: '25px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '13px', color: 'var(--muted)'}}>
          New Partner? <Link href="/promoter" style={{color: 'var(--accent)', fontWeight: 'bold'}}>Create Account</Link>
        </div>

      </div>
    </div>
  );
}