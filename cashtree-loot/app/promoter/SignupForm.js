'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, AlertTriangle, Loader2, User, AtSign, Phone, CreditCard, Lock, Tag } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [refCode, setRefCode] = useState('');
  const [ready, setReady]     = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', username: '', phone: '',
    password: '', upiId: ''
  });

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setRefCode(ref.toUpperCase());
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername    = formData.username.trim().toUpperCase();
    const generatedEmail   = `${cleanUsername}@cashttree.internal`;

    try {
      if (cleanUsername.includes(' ')) throw new Error("Username cannot contain spaces.");
      if (formData.password.length < 6) throw new Error("Password must be at least 6 characters.");

      let referrerId = null;
      if (refCode && refCode.trim()) {
        const { data: foundId, error: lookupError } = await supabase
          .rpc('get_promoter_id_by_username', { lookup_name: refCode.trim() });
        if (foundId && !lookupError) referrerId = foundId;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: formData.password,
      });
      if (authError) throw authError;

      const { error: dbError } = await supabase.from('accounts').insert({
        id: authData.user.id,
        role: 'promoter',
        username: cleanUsername,
        full_name: formData.fullName,
        phone: formData.phone,
        upi_id: formData.upiId || null,
        referred_by: referrerId,
        is_frozen: false,
        signup_bonus_given: false,
      });
      if (dbError) throw dbError;

      alert("Account Created Successfully! Login to check your bonus.");
      router.push('/login');

    } catch (err) {
      setError(err.message.includes("already registered")
        ? "Username is taken. Please choose another."
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) =>
    setFormData((p) => ({
      ...p,
      [key]: key === 'username' ? e.target.value.toUpperCase() : e.target.value,
    }));

  return (
    <>
      <style>{`
        :root {
          --neon:      #00ff88;
          --neon-glow: rgba(0,255,136,0.28);
          --neon-dim:  rgba(0,255,136,0.08);
          --border-l:  rgba(255,255,255,0.07);
          --border-h:  rgba(255,255,255,0.14);
          --muted:     #555;
          --ease:      cubic-bezier(0.16,1,0.3,1);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-wrap {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          background: #030305;
          position: relative; overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Ambient glows */
        .sp-glow-1 { position: fixed; top: -20%; left: -10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(0,255,136,0.055) 0%, transparent 65%); pointer-events: none; z-index: 0; }
        .sp-glow-2 { position: fixed; bottom: -20%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,130,246,0.045) 0%, transparent 65%); pointer-events: none; z-index: 0; }
        .sp-grid   { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 52px 52px; mask-image: radial-gradient(circle at center, black 30%, transparent 78%); }

        /* Card */
        .sp-card {
          width: 100%; max-width: 520px;
          background: rgba(10,10,15,0.72);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border: 1px solid var(--border-l);
          border-top: 1px solid rgba(255,255,255,0.11);
          border-radius: 28px;
          padding: 44px 40px;
          position: relative; z-index: 10;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,0,0,0.4);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
        }
        .sp-card.in { opacity: 1; transform: translateY(0); }

        /* Header */
        .sp-brand { font-size: 18px; font-weight: 900; letter-spacing: -0.04em; text-decoration: none; display: block; text-align: center; margin-bottom: 32px; color: #fff; }
        .sp-brand span { color: var(--neon); text-shadow: 0 0 18px var(--neon-glow); }

        .sp-badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: 100px; background: var(--neon-dim); border: 1px solid rgba(0,255,136,0.18); margin-bottom: 14px; }
        .sp-dot   { width: 6px; height: 6px; background: var(--neon); border-radius: 50%; box-shadow: 0 0 8px var(--neon); animation: ring 2s infinite; }
        @keyframes ring { 0%{box-shadow:0 0 0 0 rgba(0,255,136,0.5)} 70%{box-shadow:0 0 0 7px rgba(0,255,136,0)} 100%{box-shadow:0 0 0 0 rgba(0,255,136,0)} }
        .sp-badge-text { font-size: 10px; font-weight: 800; color: var(--neon); text-transform: uppercase; letter-spacing: 1.4px; }

        .sp-title { font-size: clamp(1.7rem, 4vw, 2.1rem); font-weight: 900; color: #fff; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 6px; }
        .sp-title span { color: var(--neon); }
        .sp-sub   { font-size: 13px; color: var(--muted); margin-bottom: 34px; line-height: 1.5; }

        /* Divider */
        .sp-divider { height: 1px; background: var(--border-l); margin: 28px 0; }

        /* Field */
        .sp-field { margin-bottom: 18px; }
        .sp-label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .sp-label svg { opacity: 0.6; }

        .sp-input-wrap { position: relative; }
        .sp-input {
          width: 100%; background: rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff; padding: 14px 16px;
          border-radius: 14px; font-size: 14px; font-weight: 500;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: inherit;
        }
        .sp-input::placeholder { color: #333; }
        .sp-input:focus { border-color: rgba(0,255,136,0.4); box-shadow: 0 0 0 4px rgba(0,255,136,0.07); background: rgba(0,0,0,0.6); }
        .sp-input.mono { font-family: 'SF Mono','Menlo','Courier New',monospace; letter-spacing: 1px; font-size: 13px; }
        .sp-input.neon { border-color: rgba(0,255,136,0.35); color: var(--neon); }

        .sp-input-tick { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--neon); display: flex; }

        /* Two col grid */
        .sp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Referral box */
        .sp-ref-applied { background: rgba(0,255,136,0.04); border: 1px dashed rgba(0,255,136,0.2); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
        .sp-ref-label   { font-size: 10px; color: var(--neon); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
        .sp-ref-code    { font-size: 12px; color: #fff; font-weight: 700; font-family: monospace; }

        /* Error */
        .sp-error { display: flex; align-items: center; gap: 10px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 13px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 22px; animation: shake 0.3s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }

        /* Button */
        .sp-btn {
          width: 100%; padding: 16px; margin-top: 8px;
          background: var(--neon); color: #000;
          font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px;
          border: none; border-radius: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: transform 0.2s var(--ease), box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 0 24px rgba(0,255,136,0.22);
        }
        .sp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,255,136,0.32); }
        .sp-btn:disabled { opacity: 0.55; cursor: wait; }

        .sp-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .sp-footer { text-align: center; margin-top: 22px; font-size: 13px; color: #444; }
        .sp-footer a { color: #888; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .sp-footer a:hover { color: #fff; }

        /* Stats row */
        .sp-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border-l); border: 1px solid var(--border-l); border-radius: 16px; overflow: hidden; margin-bottom: 32px; }
        .sp-stat  { background: rgba(0,0,0,0.5); padding: 14px 10px; text-align: center; }
        .sp-stat-v { font-size: 17px; font-weight: 900; color: #fff; font-family: 'SF Mono','Menlo',monospace; letter-spacing: -0.04em; }
        .sp-stat-l { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-top: 3px; }

        @media(max-width:520px){
          .sp-card { padding: 32px 22px; border-radius: 20px; }
          .sp-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sp-wrap">
        <div className="sp-glow-1" />
        <div className="sp-glow-2" />
        <div className="sp-grid" />

        <div className={`sp-card ${ready ? 'in' : ''}`}>

          {/* Brand */}
          <Link href="/" className="sp-brand">
            Cash<span>Tree</span>
          </Link>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="sp-badge" style={{ margin: '0 auto 14px' }}>
              <span className="sp-dot" />
              <span className="sp-badge-text">Partner Registration</span>
            </div>
            <h1 className="sp-title">
              Join the <span>Network</span>
            </h1>
            <p className="sp-sub">Create your promoter account and start earning instantly.</p>
          </div>

          {/* Trust stats */}
          <div className="sp-stats">
            <div className="sp-stat">
              <div className="sp-stat-v">5K+</div>
              <div className="sp-stat-l">Partners</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat-v" style={{ color: 'var(--neon)' }}>T+0</div>
              <div className="sp-stat-l">Payouts</div>
            </div>
            <div className="sp-stat">
              <div className="sp-stat-v">100%</div>
              <div className="sp-stat-l">Verified</div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="sp-error">
              <AlertTriangle size={15} strokeWidth={2.5} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup}>

            <div className="sp-field">
              <label className="sp-label"><User size={11} /> Full Name</label>
              <input className="sp-input" type="text" required placeholder="John Doe"
                value={formData.fullName} onChange={set('fullName')} />
            </div>

            <div className="sp-field">
              <label className="sp-label"><AtSign size={11} /> Username <span style={{ color: '#333', marginLeft: 4 }}>— your unique login ID</span></label>
              <input className="sp-input mono" type="text" required placeholder="UNIQUE_ID"
                value={formData.username} onChange={set('username')} />
            </div>

            <div className="sp-grid-2">
              <div className="sp-field">
                <label className="sp-label"><Phone size={11} /> Phone</label>
                <input className="sp-input" type="tel" placeholder="+91 98765..."
                  value={formData.phone} onChange={set('phone')} />
              </div>
              <div className="sp-field">
                <label className="sp-label"><CreditCard size={11} /> UPI ID <span style={{ color: '#333' }}>— optional</span></label>
                <input className="sp-input" type="text" placeholder="user@upi"
                  value={formData.upiId} onChange={set('upiId')} />
              </div>
            </div>

            <div className="sp-field">
              <label className="sp-label"><Lock size={11} /> Password</label>
              <input className="sp-input" type="password" required placeholder="Min. 6 characters"
                value={formData.password} onChange={set('password')} />
            </div>

            <div className="sp-divider" />

            <div className="sp-field">
              <label className="sp-label"><Tag size={11} /> Referral Code <span style={{ color: '#333', marginLeft: 4 }}>— optional</span></label>
              <div className="sp-input-wrap">
                <input
                  className={`sp-input mono ${refCode ? 'neon' : ''}`}
                  type="text" placeholder="OPTIONAL"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  style={{ paddingRight: refCode ? '42px' : '16px' }}
                />
                {refCode && (
                  <span className="sp-input-tick">
                    <Check size={15} strokeWidth={3} />
                  </span>
                )}
              </div>
              {refCode && (
                <div className="sp-ref-applied">
                  <span className="sp-ref-label">✓ Referral Applied</span>
                  <span className="sp-ref-code">{refCode}</span>
                </div>
              )}
            </div>

            <button type="submit" className="sp-btn" disabled={loading}>
              {loading ? (
                <><Loader2 size={16} className="sp-spin" /> Initializing...</>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="sp-footer">
            Already a partner?{' '}
            <Link href="/login">Login Here</Link>
          </div>
        </div>
      </div>
    </>
  );
}