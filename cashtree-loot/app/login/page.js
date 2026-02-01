'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Send } from 'lucide-react'; // Icons for the popup

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ⚠️ REPLACE THIS WITH YOUR ACTUAL TELEGRAM USERNAME
const ADMIN_TELEGRAM_USER = "kenzbilal";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false); // New Modal State
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // 🧹 CLEANUP: Automatically clear old sessions
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

  // 🔵 TELEGRAM REDIRECT LOGIC
  const handleContactAdmin = () => {
    const text = `Hello Admin, I forgot my CashTree password. My username is: ${formData.username || 'Type your username here'}`;
    const url = `https://t.me/${ADMIN_TELEGRAM_USER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowForgotModal(false);
  };

  // --- STYLES ---
  const wrapperStyle = {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#050505', padding: '20px', position: 'relative'
  };

  const cardStyle = {
    width: '100%', maxWidth: '400px',
    background: '#0a0a0a',
    border: '1px solid #222', borderRadius: '24px',
    padding: '40px 30px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    zIndex: 10
  };

  const inputStyle = {
    width: '100%', padding: '14px',
    background: '#000', border: '1px solid #222', color: '#fff',
    borderRadius: '12px', fontSize: '16px', marginBottom: '16px',
    outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle = {
    fontSize:'11px', fontWeight:'700', color:'#666', 
    textTransform:'uppercase', letterSpacing:'1px', marginLeft:'4px', marginBottom:'6px', display:'block'
  };

  const btnStyle = {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #22c55e, #14532d)', 
    color: '#fff', fontWeight: '800', border: 'none', borderRadius: '14px', fontSize: '16px',
    cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
    marginTop: '10px', opacity: loading ? 0.7 : 1
  };

  // Small Red Link below button
  const forgotLinkStyle = {
    display: 'block', width: '100%', textAlign: 'center',
    fontSize: '11px', fontWeight: '700', color: '#ef4444', // Red
    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
    marginTop: '20px', textDecoration: 'none'
  };

  // --- MODAL STYLES ---
  const modalOverlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
  };

  const modalContentStyle = {
    background: '#111', border: '1px solid #333', borderRadius: '24px',
    padding: '30px', maxWidth: '320px', width: '90%', textAlign: 'center',
    boxShadow: '0 0 50px rgba(239, 68, 68, 0.2)' // Red Glow
  };

  return (
    <div style={wrapperStyle}>
      
      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div style={modalOverlayStyle} onClick={() => setShowForgotModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{marginBottom: '20px', display: 'inline-flex', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%'}}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>
            <h3 style={{color: '#fff', margin: '0 0 10px 0', fontSize: '18px'}}>Recovery Mode</h3>
            <p style={{color: '#888', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px'}}>
              For security reasons, passwords can only be reset manually by the administrator.
            </p>
            
            <button onClick={handleContactAdmin} style={{
              width: '100%', padding: '14px', background: '#ef4444', color: '#fff',
              border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <Send size={16} /> CONTACT ADMIN
            </button>

            <button onClick={() => setShowForgotModal(false)} style={{
              background: 'transparent', border: 'none', color: '#666', fontSize: '12px',
              marginTop: '15px', cursor: 'pointer', textDecoration: 'underline'
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        
        {/* --- FIXED LOGO ALIGNMENT START --- */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          marginBottom: '30px', width: '100%', position: 'relative'
        }}>
          
          {/* Container with Fixed Width = Perfect Centering */}
          <div style={{position: 'relative', height: '50px', width: '280px'}}>
            
            {/* 1. Base Text (Center) */}
            <h1 style={{
              fontSize: '36px', fontWeight: '900', color: '#111', 
              margin: 0, letterSpacing: '4px', textAlign: 'center', width: '100%',
              position: 'absolute', top: 0, left: 0, zIndex: 1
            }}>
              CASHTREE
            </h1>

            {/* 2. Outline Overlay (Center) */}
            <h1 style={{
              fontSize: '36px', fontWeight: '900', color: 'transparent', 
              WebkitTextStroke: '1px #333',
              margin: 0, letterSpacing: '4px', textAlign: 'center', width: '100%',
              position: 'absolute', top: 0, left: 0, zIndex: 2
            }}>
              CASHTREE
            </h1>

            {/* 3. Liquid Fill (Center Absolute) */}
            <div style={{
              position: 'absolute', top: 0, 
              left: '50%', transform: 'translateX(-50%)', 
              zIndex: 3, width: 'max-content'
            }}>
                <h1 className="liquid-text" style={{
                  fontSize: '36px', fontWeight: '900', 
                  margin: 0, letterSpacing: '4px', 
                  overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
                  borderRight: '2px solid #00ff88', 
                  /* CHANGED: 'infinite' -> 'forwards' (Runs once and STAYS lit) */
                  animation: 'fillUp 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                }}>
                  <span style={{color: '#fff'}}>CASH</span>
                  <span style={{color: '#00ff88'}}>TREE</span>
                </h1>
            </div>

          </div>

          <p style={{color: '#666', fontSize: '13px', marginTop: '5px'}}>
            Secure Partner Portal
          </p>

        </div>
        {/* --- LOGO END --- */}

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
          
          <div>
            <label style={labelStyle}>Username</label>
            <input 
              type="text" required style={inputStyle} placeholder="Enter Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#22c55e'}
              onBlur={(e) => e.target.style.borderColor = '#222'}
            />
          </div>

          <div>
             <label style={labelStyle}>Password</label>
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
          
          {/* RED FORGOT LINK (Small, Centered, Below Green Button) */}
          <span onClick={() => setShowForgotModal(true)} style={forgotLinkStyle}>
             Forgot Password?
          </span>

        </form>

        {/* FOOTER */}
        <div style={{marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #222', textAlign: 'center', fontSize: '13px', color: '#666'}}>
          New Partner? <Link href="/promoter" style={{color: '#22c55e', fontWeight: 'bold', textDecoration: 'none'}}>Create Account</Link>
        </div>

      </div>

      <style jsx>{`
        @keyframes fillUp {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}