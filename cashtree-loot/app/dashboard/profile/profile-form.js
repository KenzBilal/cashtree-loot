'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Lock, User, CreditCard, Mail, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function EmailPopup({ onSave, onDismiss }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!email.includes('@')) { setError('Enter a valid email address'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave(email);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        position: 'relative', background: '#0a0a0a', border: '1px solid #222',
        borderRadius: '22px', padding: '32px 28px', maxWidth: '340px', width: '100%',
        boxShadow: '0 0 60px rgba(0,255,136,0.08)'
      }}>
        <button onClick={onDismiss} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'none',
          border: 'none', color: '#555', cursor: 'pointer', padding: '4px'
        }}><X size={18} /></button>

        <div style={{
          width: '52px', height: '52px', borderRadius: '16px', margin: '0 auto 18px',
          background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Mail size={22} color="#00ff88" />
        </div>

        <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '16px', fontWeight: '900', textAlign: 'center' }}>
          Add Recovery Email
        </h3>
        <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.6', margin: '0 0 20px', textAlign: 'center' }}>
          Add an email so the admin can reset your password if you get locked out.
        </p>

        <input
          type="email" value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="your@email.com"
          style={{
            width: '100%', padding: '13px 14px', boxSizing: 'border-box',
            background: '#000', border: '1px solid #2a2a2a', color: '#fff',
            borderRadius: '12px', fontSize: '14px', outline: 'none',
            fontFamily: 'inherit', marginBottom: '10px'
          }}
        />
        {error && <div style={{ color: '#f87171', fontSize: '11px', marginBottom: '10px' }}>{error}</div>}

        <button onClick={handleSave} disabled={loading} style={{
          width: '100%', padding: '13px', background: '#00ff88', color: '#000',
          border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '13px',
          cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
          textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px'
        }}>
          {loading ? 'Saving…' : 'Save Email'}
        </button>
        <button onClick={onDismiss} style={{
          width: '100%', background: 'none', border: 'none', color: '#444',
          fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px'
        }}>
          Remind Me Later
        </button>
      </div>
    </div>
  );
}

export default function ProfileForm({ account }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const [formData, setFormData] = useState({
    full_name: account.full_name || '',
    upi_id: account.upi_id || '',
    email: account.email || '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!account.email) {
      const dismissed = sessionStorage.getItem('email_popup_dismissed');
      if (!dismissed) {
        const t = setTimeout(() => setShowEmailPopup(true), 800);
        return () => clearTimeout(t);
      }
    }
  }, [account.email]);

  const dismissPopup = () => {
    sessionStorage.setItem('email_popup_dismissed', '1');
    setShowEmailPopup(false);
  };

  // Saves email ONLY to accounts table — never calls supabase.auth.updateUser with email
  const saveEmailToAccountsOnly = async (email) => {
    const { error } = await supabase
      .from('accounts')
      .update({ email })
      .eq('id', account.id);
    if (error) throw error;
    setFormData(prev => ({ ...prev, email }));
    sessionStorage.setItem('email_popup_dismissed', '1');
    setShowEmailPopup(false);
    setMessage({ type: 'success', text: '✅ Recovery email saved!' });
    router.refresh();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    let successMsg = '✅ Profile updated!';

    try {
      if (formData.new_password || formData.confirm_password) {
        if (formData.new_password !== formData.confirm_password) throw new Error('Passwords do not match.');
        if (formData.new_password.length < 6) throw new Error('Password must be at least 6 characters.');
      }

      // IMPORTANT: Only update accounts table for email — never touch Supabase auth email
      const { error: dbError } = await supabase
        .from('accounts')
        .update({
          full_name: formData.full_name,
          upi_id: formData.upi_id,
          email: formData.email || null,
        })
        .eq('id', account.id);

      if (dbError) throw dbError;

      // Only password goes to Supabase auth — email never does
      if (formData.new_password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.new_password
        });
        if (authError) throw authError;
        successMsg = '✅ Profile & password updated!';
      }

      setMessage({ type: 'success', text: successMsg });
      setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' }));
      router.refresh();

    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = 'ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    await supabase.auth.signOut();
    router.push('/login');
  };

  const NEON = '#00ff88';

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', fontWeight: '800', color: '#888',
    textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px', paddingLeft: '4px'
  };

  const getInputStyle = (fieldName) => ({
    width: '100%', padding: '16px', boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.3)',
    border: focusedField === fieldName ? `1px solid ${NEON}` : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', color: '#fff', fontSize: '15px', marginBottom: '24px',
    outline: 'none', transition: 'all 0.3s ease', fontFamily: 'inherit',
    boxShadow: focusedField === fieldName ? '0 0 15px rgba(0,255,136,0.1)' : 'none'
  });

  return (
    <div style={{ marginTop: '20px' }}>

      {showEmailPopup && (
        <EmailPopup onSave={saveEmailToAccountsOnly} onDismiss={dismissPopup} />
      )}

      {message && (
        <div style={{
          padding: '16px', marginBottom: '24px', borderRadius: '16px',
          fontSize: '13px', fontWeight: 'bold', textAlign: 'center',
          background: message.type === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.type === 'success' ? NEON : '#f87171',
          border: message.type === 'success' ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(239,68,68,0.2)'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdate}>

        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}><User size={12} /> Full Name</label>
          <input
            type="text" value={formData.full_name}
            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            onFocus={() => setFocusedField('full_name')} onBlur={() => setFocusedField(null)}
            placeholder="Enter your name" style={getInputStyle('full_name')}
          />

          <label style={labelStyle}><CreditCard size={12} /> Default UPI ID</label>
          <input
            type="text" value={formData.upi_id}
            onChange={e => setFormData({ ...formData, upi_id: e.target.value })}
            onFocus={() => setFocusedField('upi_id')} onBlur={() => setFocusedField(null)}
            placeholder="example@oksbi" style={getInputStyle('upi_id')}
          />

          <label style={labelStyle}><Mail size={12} /> Recovery Email</label>
          <input
            type="email" value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
            placeholder="your@email.com" style={getInputStyle('email')}
          />
          <div style={{ fontSize: '11px', color: '#555', marginTop: '-18px', marginBottom: '20px', paddingLeft: '4px' }}>
            For password recovery only — not used for login
          </div>
        </div>

        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
          <div style={{ fontSize: '12px', color: NEON, fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
            Security Settings
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}><Lock size={12} /> New Password</label>
              <input
                type="password" value={formData.new_password}
                onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                onFocus={() => setFocusedField('new_password')} onBlur={() => setFocusedField(null)}
                placeholder="••••••" style={getInputStyle('new_password')}
              />
            </div>
            <div>
              <label style={labelStyle}><Lock size={12} /> Confirm</label>
              <input
                type="password" value={formData.confirm_password}
                onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                onFocus={() => setFocusedField('confirm_password')} onBlur={() => setFocusedField(null)}
                placeholder="••••••" style={getInputStyle('confirm_password')}
              />
            </div>
          </div>
          {formData.new_password && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '-15px', marginBottom: '20px', textAlign: 'right' }}>
              *Leave blank to keep current password
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '18px',
          background: 'linear-gradient(135deg, #00ff88, #00b36b)', color: '#000',
          border: 'none', borderRadius: '16px', fontWeight: '800',
          cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
          boxShadow: '0 0 20px rgba(0,255,136,0.3)', marginTop: '10px',
          fontFamily: 'inherit', fontSize: '14px'
        }}>
          {loading ? 'Processing...' : 'Save Changes'}
        </button>
      </form>

      <button onClick={handleLogout} style={{
        width: '100%', marginTop: '20px', padding: '16px',
        background: 'rgba(239,68,68,0.05)', color: '#f87171',
        border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px',
        fontWeight: '700', cursor: 'pointer', fontSize: '13px',
        textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'inherit'
      }}>
        Sign Out Securely
      </button>
    </div>
  );
}