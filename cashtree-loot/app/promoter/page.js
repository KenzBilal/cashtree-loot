'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PromoterPage() {
  return (
    <Suspense fallback={<div style={{color:'#fff', textAlign:'center', marginTop:'50px'}}>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refCode, setRefCode] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    upiId: ''
  });

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setRefCode(ref.toUpperCase());
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.username.includes(' ')) throw new Error("Username cannot contain spaces.");
      if (formData.password.length < 6) throw new Error("Password must be at least 6 chars.");

      let referrerId = null;
      if (refCode) {
        const { data: referrer } = await supabase
          .from('accounts')
          .select('id')
          .eq('username', refCode)
          .single();
        if (referrer) referrerId = referrer.id;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed.");

      const { error: dbError } = await supabase
        .from('accounts')
        .insert({
          id: authData.user.id,
          role: 'promoter',
          username: formData.username,
          full_name: formData.fullName,
          phone: formData.phone,
          upi_id: formData.upiId || null,
          referred_by: referrerId,
          is_frozen: false
        });

      if (dbError) throw new Error("Could not create profile. Username might be taken.");

      alert("Account Created! Redirecting to Login...");
      router.push('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES (Inline to match your globals.css variables) ---
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '500px',
    background: 'var(--bg-2)', // Uses your #07101a
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '30px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-1)', // Uses your #04060a
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    marginTop: '6px',
    marginBottom: '16px'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const btnStyle = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
    color: '#022c22',
    fontWeight: '800',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
           <div style={{color: 'var(--accent)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom:'10px'}}>
             Secure Partner Access
           </div>
           <h1 style={{fontSize: '28px', margin: '0', fontWeight: '900'}}>
             Promoter <span style={{color: 'var(--accent)'}}>Sign Up</span>
           </h1>
        </div>

        {error && (
          <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" style={inputStyle} required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="John Doe" />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" style={inputStyle} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
          </div>

          <div>
            <label style={labelStyle}>Username</label>
            <input type="text" style={inputStyle} required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toUpperCase()})} placeholder="UNIQUE_ID" />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="98765..." />
            </div>
            <div>
              <label style={labelStyle}>UPI ID (Optional)</label>
              <input type="text" style={inputStyle} value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} placeholder="user@upi" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" style={inputStyle} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="******" />
          </div>

          <div>
            <label style={labelStyle}>Referral Code</label>
            <input type="text" style={{...inputStyle, fontFamily: 'monospace', letterSpacing: '1px'}} value={refCode} onChange={e => setRefCode(e.target.value.toUpperCase())} placeholder="OPTIONAL" />
          </div>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <div style={{textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--muted)'}}>
          Already have an account? <Link href="/login" style={{color: 'var(--accent)', fontWeight: 'bold'}}>Login Here</Link>
        </div>

      </div>
    </div>
  );
}