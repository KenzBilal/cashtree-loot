'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, MapPin, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Support', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'Support', message: '' });
    }, 1500);
  };

  return (
    <div className="main-wrapper">
      
      {/* --- HEADER --- */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">Cash<span>Tree</span></Link>
          <div className="nav-links">
             <Link href="/">Back to Home</Link>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="contact-split animate-fluent">
        
        {/* LEFT SIDE: INFO */}
        <div className="contact-left">
          <span className="tag success" style={{marginBottom: '20px', display: 'inline-block'}}>● 24/7 Priority Support</span>
          <h1>Let's scale your <br/> traffic together.</h1>
          <p>
            Whether you are a publisher looking for custom rates or a brand wanting to list an offer, our team is ready to deploy.
          </p>

          <div className="contact-methods">
            <a href="mailto:help@cashttree.online" className="method-item">
              <div className="method-icon"><Mail /></div>
              <div className="method-text">
                <h4>Email Support</h4>
                <span>help@cashttree.online</span>
              </div>
            </a>
            
            <a href="https://t.me/CashtTree_bot" target="_blank" className="method-item">
              <div className="method-icon"><MessageCircle /></div>
              <div className="method-text">
                <h4>Telegram Live</h4>
                <span>@CashTreeSupport</span>
              </div>
            </a>

            <div className="method-item">
              <div className="method-icon"><MapPin /></div>
              <div className="method-text">
                <h4>Headquarters</h4>
                <span>Bengaluru, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="contact-form-card">
          {status === 'success' ? (
            <div style={{textAlign: 'center', padding: '40px 0'}}>
              <CheckCircle2 size={60} color="#00ff88" style={{margin: '0 auto 20px'}}/>
              <h3 style={{color: 'white', fontSize: '1.5rem', marginBottom: '10px'}}>Message Received</h3>
              <p style={{color: '#888', marginBottom: '30px'}}>Our team will contact you within 4 hours.</p>
              <button onClick={() => setStatus('idle')} className="btn-send">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{color: 'white', fontSize: '1.5rem', marginBottom: '25px'}}>Send a Request</h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="form-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Type</label>
                <select 
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option value="Support">Publisher Support</option>
                  <option value="Payment">Payment Issue</option>
                  <option value="Partnership">Brand Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  required
                  className="form-textarea"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn-send" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* --- FOOTER (Simplified) --- */}
      <footer style={{textAlign: 'center', padding: '40px', borderTop: '1px solid #222', color: '#666', fontSize: '0.9rem'}}>
        © 2026 CashTree Network. All rights reserved.
      </footer>

    </div>
  );
}