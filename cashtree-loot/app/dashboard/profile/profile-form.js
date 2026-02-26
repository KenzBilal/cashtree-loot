'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Lock, User, CreditCard, Mail, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── EMAIL COLLECTION POPUP ──────────────────────────────────────────────────
function EmailPopup({ onClose, onSaved, userId }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    try {
      // Update Supabase Auth email
      const { error: authError } = await supabase.auth.updateUser({ email: clean });
      if (authError) throw authError;

      // Update accounts table
      const { error: dbError } = await supabase
        .from('accounts')
        .update({ email: clean })
        .eq('id', userId);
      if (dbError) throw dbError;

      onSaved(clean);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px', padding: '36px 28px', maxWidth: '380px', width: '100%',
        boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
        animation: 'popupIn 0.3s cubic-bezier(0.16,1,0.3,1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Mail size={20} color="#00ff88" />
            </div>
            <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: '18px', fontWeight: '900', letterSpacing: '-0.03em' }}>Add Your Email</h3>
            <p style={{ color: '#555', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
              Secure your account with a recovery email. Used for password resets only.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '4px', marginTop: '-4px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <input
            type="email" required
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            style={{
              width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
              color: '#fff', fontSize: '14px', outline: 'none',
              fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: '#00ff88', color: '#000',
            border: 'none', borderRadius: '13px', fontWeight: '900', fontSize: '12px',
            textTransform: 'uppercase', letterSpacing: '1px', cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
            boxShadow: '0 0 20px rgba(0,255,136,0.2)'
          }}>
            {loading ? 'Saving...' : 'Save Email'}
          </button>
        </form>

        <button onClick={onClose} style={{
          display: 'block', width: '100%', textAlign: 'center',
          background: 'none', border: 'none', color: '#444', fontSize: '11px',
          fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px',
          marginTop: '14px', cursor: 'pointer', fontFamily: 'inherit'
        }}>
          Remind Me Later
        </button>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── MAIN PROFILE FORM ───────────────────────────────────────────────────────
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

  // Show popup if user has no email saved
  useEffect(() => {
    if (!account.email) {
      const dismissed = sessionStorage.getItem('email_popup_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowEmailPopup(true), 800);
      }
    }
  }, [account.email]);

  const handleDismissPopup = () => {
    sessionStorage.setItem('email_popup_dismissed', '1');
    setShowEmailPopup(false);
  };

  const handleEmailSaved = (savedEmail) => {
    setFormData(prev => ({ ...prev, email: savedEmail }));
    setShowEmailPopup(false);
    setMessage({ type: 'success', text: '✅ Email saved successfully!' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let successMsg = '✅ Profile details updated!';

    try {
      if (formData.new_password || formData.confirm_password) {
        if (formData.new_password !== formData.confirm_password) throw new Error("Passwords do not match.");
        if (formData.new_password.length < 6) throw new Error("Password must be at least 6 characters.");
      }

      // Build DB update object
      const updates = {
        full_name: formData.full_name,
        upi_id: formData.upi_id,
      };

      // Include email if changed
      const cleanEmail = formData.email.trim().toLowerCase();
      if (cleanEmail && cleanEmail !== account.email) {
        if (!cleanEmail.includes('@')) throw new Error("Please enter a valid email address.");
        updates.email = cleanEmail;
      }

      const { error: dbError } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', account.id);
      if (dbError) throw dbError;

      // Update auth email if changed
      if (cleanEmail && cleanEmail !== account.email) {
        const { error: authEmailError } = await supabase.auth.updateUser({ email: cleanEmail });
        if (authEmailError) throw authEmailError;
        successMsg = '✅ Profile updated! Check your email to confirm the new address.';
      }

      // Update password if filled
      if (formData.new_password) {
        const { error: authError } = await supabase.auth.updateUser({ password: formData.new_password });
        if (authError) throw authError;
        successMsg = '✅ Profile & Password updated successfully!';
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
    document.cookie = "ct_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    await supabase.auth.signOut();
    router.push('/login');
  };

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', fontWeight: '800', color: '#888',
    textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px', paddingLeft: '4px'
  };

  const getInputStyle = (fieldName) => ({
    width: '100%', padding: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: focusedField === fieldName ? '1px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px', color: '#fff', fontSize: '15px',
    marginBottom: '24px', outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    boxShadow: focusedField === fieldName ? '0 0 15px rgba(0, 255, 136, 0.1)' : 'none',
    fontFamily: 'inherit'
  });

  const btnStyle = {
    width: '100%', padding: '18px',
    background: 'linear-gradient(135deg, #00ff88, #00b36b)', color: '#000',
    border: 'none', borderRadius: '16px', fontWeight: '800',
    cursor: loading ? 'wait' : 'pointer', textTransform: 'uppercase', letterSpacing: '1px',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)', marginTop: '10px',
    transition: 'transform 0.2s', fontFamily: 'inherit', fontSize: '13px'
  };

  const logoutStyle = {
    width: '100%', marginTop: '20px', padding: '16px',
    background: 'rgba(239, 68, 68, 0.05)', color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px',
    fontWeight: '700', cursor: 'pointer', fontSize: '13px',
    textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'inherit'
  };

  return (
    <>
      {showEmailPopup && (
        <EmailPopup
          onClose={handleDismissPopup}
          onSaved={handleEmailSaved}
          userId={account.id}
        />
      )}

      <div style={{ marginTop: '20px' }}>

        {message && (
          <div style={{
            padding: '16px', marginBottom: '24px', borderRadius: '16px',
            fontSize: '13px', fontWeight: 'bold', textAlign: 'center',
            background: message.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#00ff88' : '#f87171',
            border: message.type === 'success' ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate}>

          {/* SECTION 1: PUBLIC DETAILS */}
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}><User size={12} /> Full Name</label>
            <input type="text" value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              onFocus={() => setFocusedField('full_name')} onBlur={() => setFocusedField(null)}
              placeholder="Enter your name" style={getInputStyle('full_name')} />

            <label style={labelStyle}><Mail size={12} /> Email Address
              {!account.email && <span style={{ color: '#ef4444', marginLeft: '4px', fontSize: '10px' }}>— not set</span>}
            </label>
            <input type="email" value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
              placeholder="you@example.com" style={getInputStyle('email')} />

            <label style={labelStyle}><CreditCard size={12} /> Default UPI ID</label>
            <input type="text" value={formData.upi_id}
              onChange={e => setFormData({ ...formData, upi_id: e.target.value })}
              onFocus={() => setFocusedField('upi_id')} onBlur={() => setFocusedField(null)}
              placeholder="example@oksbi" style={getInputStyle('upi_id')} />
          </div>

          {/* SECTION 2: SECURITY */}
          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '10px' }}>
            <div style={{ fontSize: '12px', color: '#00ff88', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>
              Security Settings
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}><Lock size={12} /> New Password</label>
                <input type="password" value={formData.new_password}
                  onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                  onFocus={() => setFocusedField('new_password')} onBlur={() => setFocusedField(null)}
                  placeholder="••••••" style={getInputStyle('new_password')} />
              </div>
              <div>
                <label style={labelStyle}><Lock size={12} /> Confirm</label>
                <input type="password" value={formData.confirm_password}
                  onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                  onFocus={() => setFocusedField('confirm_password')} onBlur={() => setFocusedField(null)}
                  placeholder="••••••" style={getInputStyle('confirm_password')} />
              </div>
            </div>
            {formData.new_password && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '-15px', marginBottom: '20px', textAlign: 'right' }}>
                *Leave blank to keep current password
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Processing...' : 'Save Changes'}
          </button>
        </form>

        <button onClick={handleLogout} style={logoutStyle}>
          Sign Out Securely
        </button>
      </div>
    </>
  );
}