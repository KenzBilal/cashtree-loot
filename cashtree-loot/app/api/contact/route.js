'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, MapPin, CheckCircle2, ShieldAlert, Briefcase } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', company: '', category: 'General Inquiry', message: '' 
  });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', category: 'General Inquiry', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="main-wrapper">
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">Cash<span>Tree</span></Link>
          <div className="nav-links"><Link href="/">Back to Home</Link></div>
        </div>
      </header>

      {/* BACKGROUND FX */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', background: 'rgba(0, 255, 136, 0.05)',
        filter: 'blur(120px)', zIndex: -1, pointerEvents: 'none'
      }} />

      <div className="contact-split animate-fluent">
        {/* LEFT SIDE */}
        <div className="contact-left">
          <div className="tag success" style={{marginBottom: '24px', display: 'inline-block'}}>● Enterprise Support</div>
          <h1 style={{fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', color: 'white'}}>
            Scale with <br/> <span style={{color: '#00ff88'}}>Certainty.</span>
          </h1>
          <p style={{color: '#888', fontSize: '1.1rem', marginBottom: '50px', maxWidth: '450px'}}>
            Connect directly with our network operations team.
          </p>
          <div className="contact-methods">
            <div className="method-item">
              <div className="method-icon"><Briefcase /></div>
              <div className="method-text">
                <h4 style={{color: 'white', marginBottom: '4px'}}>Partnerships</h4>
                <span style={{color: '#666', fontSize: '0.9rem'}}>partners@cashttree.online</span>
              </div>
            </div>
            <a href="https://t.me/CashtTree_bot" target="_blank" className="method-item" style={{borderColor: 'rgba(34, 158, 217, 0.3)', background: 'rgba(34, 158, 217, 0.05)'}}>
              <div className="method-icon" style={{color: '#229ED9'}}><MessageCircle /></div>
              <div className="method-text">
                <h4 style={{color: '#229ED9', marginBottom: '4px'}}>Telegram Live</h4>
                <span style={{color: '#666', fontSize: '0.9rem'}}>@CashTreeSupport</span>
              </div>
            </a>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="contact-form-card">
          {status === 'success' ? (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <CheckCircle2 size={50} color="#00ff88" style={{margin: '0 auto 20px'}}/>
              <h3 style={{color: 'white', fontSize: '1.5rem', marginBottom: '10px'}}>Ticket Created</h3>
              <p style={{color: '#888', marginBottom: '30px'}}>Our team will review your request shortly.</p>
              <button onClick={() => setStatus('idle')} className="btn-send">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{color: 'white', fontSize: '1.5rem', marginBottom: '30px', fontWeight: '800'}}>Submit Ticket</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" required className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" required className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option>General Inquiry</option>
                  <option>Advertiser Partnership</option>
                  <option>Publisher Support</option>
                  <option>Security Report</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea required className="form-textarea" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn-send" disabled={status === 'submitting'}>{status === 'submitting' ? 'Processing...' : 'Initiate Ticket'}</button>
            </form>
          )}
        </div>
      </div>
      
      <footer style={{textAlign: 'center', padding: '40px', borderTop: '1px solid #222', color: '#444', fontSize: '0.8rem', marginTop: 'auto', background: '#020202'}}>
        © 2026 CashTree Network. Secured by 256-bit SSL.
      </footer>
    </div>
  );
}