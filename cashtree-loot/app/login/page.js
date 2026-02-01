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
  useEffect(() => {
    const cleanupSession = async () => {
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
      localStorage.clear(); 
      document.cookie = "ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    };
    cleanupSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

      document.cookie = `ct_session=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;

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

  // 🔒 FORGOT PASSWORD LOGIC
  const handleForgot = () => {
    alert("🔐 ACCOUNT RECOVERY\n\nSince this is a secure partner account, please contact the Admin or Support to reset your password manually.");
  };

  // --- STYLES ---
  const wrapperStyle = {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#050505', padding: '20px'
  };

  const cardStyle = {
    width: '100%', maxWidth: '400px',
    background: '#0a0a0a',
    border: '1px solid #222', borderRadius: '24px',
    padding: '40px 30px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  };

  const inputStyle = {
    width: '100%', padding: '14px',
    background: '#000', border: '1px solid #222', color: '#fff',
    borderRadius: '12px', fontSize: '16px', marginBottom: '16px',
    outline: 'none', transition: 'border-color 0.2s'
  };

  const labelRowStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '6px', marginLeft: '4px'
  };

  const labelStyle = {
    fontSize:'11px', fontWeight:'700', color:'#666', 
    textTransform:'uppercase', letterSpacing:'1px'
  };

  const forgotLinkStyle = {
    fontSize:'11px', fontWeight:'700', color:'#22c55e', 
    cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.5px',
    textDecoration: 'none'
  };

  const btnStyle = {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #22c55e, #14532d)', 
    color: '#fff', fontWeight: '800', border: 'none', borderRadius: '14px', fontSize: '16px',
    cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
    marginTop: '10px', opacity: loading ? 0.7 : 1
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        
        {/* --- ANIMATED LOGO START --- */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          marginBottom: '30px', position: 'relative'
        }}>
          
          <div style={{position: 'relative', height: '50px', width: '250px', display:'flex', justifyContent:'center'}}>
            
            {/* 1. Base Text (Dimmed) */}
            <h1 style={{
              fontSize: '36px', fontWeight: '900', color: '#111', 
              margin: 0, letterSpacing: '4px', position: 'absolute', zIndex: 1
            }}>
              CASHTREE
            </h1>

            {/* 2. Outline Overlay */}
            <h1 style={{
              fontSize: '36px', fontWeight: '900', color: 'transparent', 
              WebkitTextStroke: '1px #333',
              margin: 0, letterSpacing: '4px', position: 'absolute', zIndex: 2
            }}>
              CASHTREE
            </h1>

            {/* 3. Neon Liquid Fill (Animated) */}
            <h1 className="liquid-text" style={{
              fontSize: '36px', fontWeight: '900', 
              margin: 0, letterSpacing: '4px', position: 'absolute', zIndex: 3,
              overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
              borderRight: '2px solid #00ff88', 
              animation: 'fillUp 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}>
              <span style={{color: '#fff'}}>CASH</span>
              <span style={{color: '#00ff88'}}>TREE</span>
            </h1>

          </div>

          <p style={{color: '#666', fontSize: '13px', marginTop: '0px'}}>
            Secure Partner Portal
          </p>

        </div>
        {/* --- ANIMATED LOGO END --- */}

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#f87171', padding: '12px', borderRadius: '10px', 
            fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin}>
          
          {/* USERNAME */}
          <div>
            <div style={labelRowStyle}>
               <label style={labelStyle}>Username</label>
            </div>
            <input 
              type="text" required style={inputStyle} placeholder="Enter Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#222'}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <div style={labelRowStyle}>
               <label style={labelStyle}>Password</label>
               {/* Forgot Password Link */}
               <span onClick={handleForgot} style={forgotLinkStyle}>
                 Forgot Password?
               </span>
            </div>
            <input 
              type="password" required style={inputStyle} placeholder="••••••••"
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

      {/* STYLES FOR ANIMATION */}
      <style jsx>{`
        @keyframes fillUp {
          0% { width: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { width: 100%; opacity: 1; }
          90% { width: 100%; opacity: 1; }
          100% { width: 0%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}