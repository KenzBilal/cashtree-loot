'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Init Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refCode, setRefCode] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
    upiId: ''
  });

  // --- 1. CAPTURE REF CODE ---
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setRefCode(ref.toUpperCase());
  }, [searchParams]);

  // --- 2. YOUR EXACT LOGIC ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanUsername = formData.username.trim().toUpperCase();
    const generatedEmail = `${cleanUsername}@cashttree.internal`;

    try {
      if (cleanUsername.includes(' ')) throw new Error("Username cannot contain spaces.");
      if (formData.password.length < 6) throw new Error("Password must be at least 6 chars.");

      // A. CHECK REFERRER
      let referrerId = null;
      if (refCode) {
        const { data: referrer } = await supabase
          .from('accounts')
          .select('id')
          .eq('username', refCode)
          .single();
        if (referrer) referrerId = referrer.id;
      }

      // B. CREATE AUTH USER
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      // C. CREATE PROFILE
      const { error: dbError } = await supabase
        .from('accounts')
        .insert({
          id: authData.user.id,
          role: 'promoter',
          username: cleanUsername,
          full_name: formData.fullName,
          phone: formData.phone, 
          upi_id: formData.upiId || null,
          referred_by: referrerId,
          is_frozen: false
        });

      if (dbError) {
        console.error("DATABASE ERROR:", dbError);
        // Preserving your specific alert for debugging
        alert(`Database Error: ${dbError.message} \nHint: Check RLS Policies!`);
        throw new Error(dbError.message);
      }

      alert("Account Created Successfully!");
      router.push('/login');

    } catch (err) {
      setError(err.message);
      if (err.message.includes("already registered")) {
        setError("Username is taken. Please choose another.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 100/100 OBSIDIAN STYLES ---
  const neonGreen = '#00ff88';

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    background: '#030305', // Deep Void
  };

  const glassCard = {
    width: '100%', maxWidth: '500px',
    background: '#0a0a0f', // Soft Obsidian
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
    position: 'relative', overflow: 'hidden'
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: '800', color: '#666', 
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', paddingLeft: '4px'
  };

  const inputStyle = {
    width: '100%', 
    background: '#050505', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#fff', 
    padding: '16px', borderRadius: '14px', fontSize: '15px', fontWeight: '600',
    outline: 'none', transition: 'border 0.2s', marginBottom: '20px'
  };

  const btnStyle = {
    width: '100%', padding: '18px', 
    background: neonGreen, color: '#000', 
    fontWeight: '900', borderRadius: '14px', border: 'none', 
    cursor: loading ? 'wait' : 'pointer', 
    marginTop: '10px', fontSize: '14px', 
    textTransform: 'uppercase', letterSpacing: '1px',
    boxShadow: `0 0 25px ${neonGreen}44`,
    transition: 'transform 0.2s',
    opacity: loading ? 0.7 : 1
  };

  return (
    <div style={containerStyle}>
      <div style={glassCard}>
        
        {/* Decorative Glow */}
        <div style={{position:'absolute', top:'-50%', right:'-50%', width:'300px', height:'300px', background:`radial-gradient(circle, ${neonGreen} 0%, transparent 70%)`, opacity:0.1, filter:'blur(80px)'}}></div>

        <div style={{position: 'relative', zIndex: 2}}>
          
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
             <div style={{color: neonGreen, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom:'10px'}}>
               Secure Partner Access
             </div>
             <h1 style={{fontSize: '32px', margin: '0', fontWeight: '900', color: '#fff', letterSpacing: '-1px'}}>
               Promoter <span style={{color: '#fff', textShadow: `0 0 20px ${neonGreen}66`}}>Sign Up</span>
             </h1>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#f87171', padding: '14px', borderRadius: '12px', 
              fontSize: '13px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            
            <div>
              <label style={labelStyle}>Full Name</label>
              <input 
                type="text" style={inputStyle} required 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                placeholder="John Doe" 
              />
            </div>

            <div>
              <label style={labelStyle}>Username (Unique Login ID)</label>
              <input 
                type="text" style={inputStyle} required 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value.toUpperCase()})} 
                placeholder="UNIQUE_ID" 
              />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input 
                  type="tel" style={inputStyle} 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="98765..." 
                />
              </div>
              <div>
                <label style={labelStyle}>UPI ID (Optional)</label>
                <input 
                  type="text" style={inputStyle} 
                  value={formData.upiId} 
                  onChange={e => setFormData({...formData, upiId: e.target.value})} 
                  placeholder="user@upi" 
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input 
                type="password" style={inputStyle} required 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="••••••" 
              />
            </div>

            <div>
              <label style={labelStyle}>Referral Code</label>
              <div style={{position: 'relative'}}>
                <input 
                  type="text" 
                  style={{
                    ...inputStyle, 
                    fontFamily: 'monospace', letterSpacing: '1px', 
                    borderColor: refCode ? neonGreen : 'rgba(255,255,255,0.1)',
                    color: refCode ? neonGreen : '#fff'
                  }} 
                  value={refCode} 
                  onChange={e => setRefCode(e.target.value.toUpperCase())} 
                  placeholder="OPTIONAL" 
                />
                {refCode && (
                  <span style={{position:'absolute', right:'16px', top:'16px', fontSize:'16px', color: neonGreen}}>✓</span>
                )}
              </div>
            </div>

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
            </button>

          </form>

          <div style={{textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#666'}}>
            Already have an account? <Link href="/login" style={{color: '#fff', fontWeight: 'bold', textDecoration: 'underline'}}>Login Here</Link>
          </div>

        </div>
      </div>
    </div>
  );
}