'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Send } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router  = useRouter();
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState({ username: '', password: '' });
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(null); };

  // ── Clean ONLY the Supabase auth key, nothing else ──
  useEffect(() => {
    try {
      const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL
        .split('//')[1].split('.')[0];
      localStorage.removeItem(`sb-${projectId}-auth-token`);
    } catch {}
    document.cookie = 'ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let email = form.username.trim();
    if (!email.includes('@')) {
      email = `${email.toUpperCase()}@cashttree.internal`;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });
      if (authError) throw new Error('Invalid credentials. Please try again.');

      const { data: account, error: roleError } = await supabase
        .from('accounts')
        .select('role, is_frozen')
        .eq('id', data.user.id)
        .single();

      if (roleError || !account) throw new Error('Account setup missing. Contact support.');

      if (account.is_frozen) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Account is frozen.');
      }

      document.cookie = `ct_session=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;

      router.push(account.role === 'admin' ? '/admin' : '/dashboard');

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleContactAdmin = () => {
    const adminHandle = process.env.NEXT_PUBLIC_ADMIN_TELEGRAM || 'CashtTree_bot';
    const text = `Hello Admin, I forgot my CashTree password. My username is: ${form.username || '[enter username]'}`;
    window.open(`https://t.me/${adminHandle}?text=${encodeURIComponent(text)}`, '_blank');
    setShowModal(false);
  };

  const NEON = '#00ff88';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#030305', padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fillUp {
          0%   { width: 0%;   opacity: 0; }
          8%   { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.28; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }

        .lg-input {
          width: 100%; padding: 13px 14px; box-sizing: border-box;
          background: #000; border: 1px solid #1e1e1e; color: #fff;
          border-radius: 12px; font-size: 15px; outline: none;
          font-family: inherit; font-weight: 600;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .lg-input::placeholder { color: #333; }
        .lg-input:focus {
          border-color: rgba(0,255,136,0.4);
          box-shadow: 0 0 0 3px rgba(0,255,136,0.06);
        }
        .lg-btn {
          width: 100%; padding: 15px; border: none; border-radius: 13px;
          background: ${NEON}; color: #000;
          font-size: 13px; font-weight: 900; letter-spacing: 1px;
          text-transform: uppercase; cursor: pointer;
          box-shadow: 0 0 24px rgba(0,255,136,0.22);
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          font-family: inherit;
        }
        .lg-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,255,136,0.34);
        }
        .lg-btn:disabled { opacity: 0.6; cursor: wait; }
        .lg-forgot:hover { color: #fff !important; }
        .lg-modal-btn:hover { opacity: 0.88; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 'min(500px, 100vw)', height: '500px',
        background: `radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#0a0a0a', border: '1px solid #222',
              borderRadius: '22px', padding: '36px 28px',
              maxWidth: '320px', width: '100%', textAlign: 'center',
              boxShadow: '0 0 60px rgba(239,68,68,0.12)',
              animation: 'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '18px', margin: '0 auto 20px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={26} color="#ef4444" />
            </div>

            <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '17px', fontWeight: '900', letterSpacing: '-0.03em' }}>
              Recovery Mode
            </h3>
            <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.65', margin: '0 0 24px' }}>
              Passwords are reset manually by the administrator for security. Tap below to message admin directly.
            </p>

            <button
              className="lg-modal-btn"
              onClick={handleContactAdmin}
              style={{
                width: '100%', padding: '13px',
                background: '#ef4444', color: '#fff', border: 'none',
                borderRadius: '12px', fontWeight: '800', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                transition: 'opacity 0.18s',
              }}
            >
              <Send size={14} /> Contact Admin
            </button>

            <button
              onClick={() => setShowModal(false)}
              style={{
                background: 'none', border: 'none', color: '#444',
                fontSize: '12px', marginTop: '16px', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '0.8px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── LOGIN CARD ── */}
      <div style={{
        width: '100%', maxWidth: '390px', position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          background: '#08080c',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', padding: '38px 30px',
          boxShadow: '0 24px 60px -12px rgba(0,0,0,0.8)',
        }}>

          {/* ── LOGO ── */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ position: 'relative', display: 'inline-block', height: '44px' }}>

              {/* Ghost base */}
              <h1 style={{
                fontSize: '34px', fontWeight: '900', color: '#111',
                margin: 0, letterSpacing: '5px', userSelect: 'none',
              }}>
                CASHTREE
              </h1>

              {/* Outline */}
              <h1 style={{
                fontSize: '34px', fontWeight: '900', color: 'transparent',
                WebkitTextStroke: '1px #252525',
                margin: 0, letterSpacing: '5px',
                position: 'absolute', top: 0, left: 0,
                userSelect: 'none',
              }}>
                CASHTREE
              </h1>

              {/* Neon fill — runs once, stays lit */}
              <h1 style={{
                fontSize: '34px', fontWeight: '900',
                margin: 0, letterSpacing: '5px',
                position: 'absolute', top: 0, left: 0,
                overflow: 'hidden', width: '0%', whiteSpace: 'nowrap',
                borderRight: '2px solid #00ff88',
                animation: 'fillUp 1.4s cubic-bezier(0.4,0,0.2,1) forwards',
                userSelect: 'none',
              }}>
                <span style={{ color: '#fff' }}>CASH</span>
                <span style={{ color: NEON }}>TREE</span>
              </h1>

              {/* Glow reflection */}
              <div style={{
                position: 'absolute', bottom: '-8px', left: 0, right: 0,
                height: '14px', background: NEON,
                filter: 'blur(22px)', opacity: 0.14,
                animation: 'glowPulse 2s infinite',
                pointerEvents: 'none',
              }} />
            </div>

            <p style={{
              color: '#444', fontSize: '11px', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '14px',
            }}>
              Secure Partner Portal
            </p>
          </div>

          {/* ── ERROR ── */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', padding: '12px 14px', borderRadius: '11px',
              fontSize: '12px', fontWeight: '700', textAlign: 'center',
              marginBottom: '20px', lineHeight: '1.5',
            }}>
              {error}
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{
                fontSize: '10px', fontWeight: '800', color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.8px',
              }}>
                Username
              </label>
              <input
                type="text"
                required
                className="lg-input"
                placeholder="Enter username"
                value={form.username}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                onChange={e => set('username', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <label style={{
                fontSize: '10px', fontWeight: '800', color: '#555',
                textTransform: 'uppercase', letterSpacing: '0.8px',
              }}>
                Password
              </label>
              <input
                type="password"
                required
                className="lg-input"
                placeholder="••••••••"
                value={form.password}
                autoComplete="current-password"
                onChange={e => set('password', e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lg-btn"
              style={{ marginTop: '6px' }}
            >
              {loading ? 'Authenticating…' : 'Enter Dashboard'}
            </button>

          </form>

          {/* ── FORGOT ── */}
          <button
            onClick={() => setShowModal(true)}
            className="lg-forgot"
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              fontSize: '11px', fontWeight: '800', color: '#ef4444',
              textTransform: 'uppercase', letterSpacing: '1px',
              marginTop: '18px', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.18s',
            }}
          >
            Forgot Password?
          </button>

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center', fontSize: '13px', color: '#444',
          }}>
            New Partner?{' '}
            <Link href="/promoter" style={{ color: NEON, fontWeight: '800', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}