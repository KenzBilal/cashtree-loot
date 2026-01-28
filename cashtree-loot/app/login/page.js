'use client';

import { useState, useEffect } from 'react';
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
    username: '',
    password: ''
  });

  // 🧹 CLEANUP: Automatically clear old sessions when page loads
  // This prevents the "Invalid Refresh Token" crash
  useEffect(() => {
    const cleanupSession = async () => {
      // 1. Clear LocalStorage
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
      localStorage.clear(); // Nuclear option for safety

      // 2. Clear Cookies (Force expire)
      document.cookie = "ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    };
    cleanupSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Username Logic (Auto-append domain if missing)
    let loginEmail = formData.username.trim(); 
    if (!loginEmail.includes('@')) {
      loginEmail = `${loginEmail.toUpperCase()}@cashttree.internal`;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: formData.password,
      });

      if (authError) throw new Error("Invalid credentials. Please try again.");

      // 2. Check Role & Freeze Status
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

      // 3. Set Session Cookie
      // (Using 'SameSite=Lax' without 'Secure' ensures it works on Localhost)
      document.cookie = `ct_session=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;

      // 4. Redirect based on Role
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
    background: '#050505', // Deep Black
    padding: '20px'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRadius: '24px',
    padding: '40px 30px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: '#000',
    border: '1px solid #222',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    fontSize:'11px', fontWeight:'700', color:'#666', 
    textTransform:'uppercase', letterSpacing:'1px', marginLeft:'4px', marginBottom:'6px', display:'block'
  };

  const btnStyle = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #22c55e, #14532d)', // Emerald Gradient
    color: '#fff',
    fontWeight: '800',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    cursor: loading ? 'wait' : 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '10px',
    opacity: loading ? 0.7 : 1
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        
        {/* LOGO */}
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={{fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', color: '#fff'}}>
            Cash<span style={{color: '#22c55e'}}>Tree</span>
          </div>
          <p style={{color: '#666', fontSize: '13px', marginTop: '5px'}}>
            Secure Partner Portal
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#f87171', 
            padding: '12px', 
            borderRadius: '10px', 
            fontSize: '13px', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin}>
          <div>
            <label style={labelStyle}>Username</label>
            <input 
              type="text" 
              required
              style={inputStyle}
              placeholder="Enter Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#222'}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              required
              style={inputStyle}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#222'}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        {/* FOOTER */}
        <div style={{marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #222', textAlign: 'center', fontSize: '13px', color: '#666'}}>
          New Partner? <Link href="/promoter" style={{color: '#22c55e', fontWeight: 'bold', textDecoration: 'none'}}>Create Account</Link>
        </div>

      </div>
    </div>
  );
}