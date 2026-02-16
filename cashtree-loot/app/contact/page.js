'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, ChevronDown, CheckCircle2, ShieldAlert, Briefcase } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    company: '',
    category: 'General Inquiry', 
    message: '' 
  });
  
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls the custom dropdown

  // Custom Options List
  const categories = [
    "General Inquiry",
    "Advertiser Partnership (Traffic Source)",
    "Publisher Support (Tracking/Payouts)",
    "Bug Bounty / Security Report",
    "Legal & Compliance"
  ];

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
      
      {/* --- HEADER --- */}
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">Cash<span>Tree</span></Link>
          <div className="nav-links">
             <Link href="/">Back to Home</Link>
          </div>
        </div>
      </header>

      {/* --- HERO FX --- */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', background: 'rgba(0, 255, 136, 0.05)',
        filter: 'blur(120px)', zIndex: -1, pointerEvents: 'none'
      }} />

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="contact-split animate-fluent">
        
        {/* LEFT SIDE: CORPORATE INFO */}
        <div className="contact-left">
          <div className="tag success" style={{marginBottom: '24px', display: 'inline-block'}}>
            ● Enterprise Support
          </div>
          <h1 style={{fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', color: 'white'}}>
            Scale with <br/> <span style={{color: '#00ff88'}}>Certainty.</span>
          </h1>
          <p style={{color: '#888', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '50px', maxWidth: '450px'}}>
            Connect directly with our network operations team. Whether you are an advertiser seeking traffic or a publisher reporting a tracking anomaly, we prioritize your ticket.
          </p>

          <div className="contact-methods">
            <div className="method-item">
              <div className="method-icon"><Briefcase /></div>
              <div className="method-text">
                <h4 style={{color: 'white', marginBottom: '4px'}}>Business Partnerships</h4>
                <span style={{color: '#666', fontSize: '0.9rem'}}>partners@cashttree.online</span>
              </div>
            </div>
            
            <a href="https://t.me/CashtTree_bot" target="_blank" className="method-item" style={{borderColor: 'rgba(34, 158, 217, 0.3)', background: 'rgba(34, 158, 217, 0.05)'}}>
              <div className="method-icon" style={{color: '#229ED9'}}><MessageCircle /></div>
              <div className="method-text">
                <h4 style={{color: '#229ED9', marginBottom: '4px'}}>Telegram Live Chat</h4>
                <span style={{color: '#666', fontSize: '0.9rem'}}>@CashTreeSupport (24/7)</span>
              </div>
            </a>
          </div>
        </div>

        {/* RIGHT SIDE: GLASS FORM */}
        <div className="contact-form-card">
          {status === 'success' ? (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <div style={{
                width: '80px', height: '80px', background: 'rgba(0, 255, 136, 0.1)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 30px'
              }}>
                <CheckCircle2 size={40} color="#00ff88"/>
              </div>
              <h3 style={{color: 'white', fontSize: '1.8rem', marginBottom: '15px', fontWeight: '800'}}>Ticket Created</h3>
              <p style={{color: '#888', marginBottom: '40px', lineHeight: '1.6'}}>
                Reference ID: #CT-{Math.floor(Math.random() * 10000)}<br/>
                Our compliance team will review your submission shortly.
              </p>
              <button onClick={() => setStatus('idle')} className="btn-send">Submit New Request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{color: 'white', fontSize: '1.5rem', marginBottom: '30px', fontWeight: '800'}}>Submit Ticket</h3>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" required className="form-input" placeholder="Enter Name"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Email</label>
                  <input 
                    type="email" required className="form-input" placeholder="name@company.com"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input 
                    type="tel" className="form-input" placeholder="+91 XXXXX XXXXX"
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Network</label>
                  <input 
                    type="text" className="form-input" placeholder="Agency Name"
                    value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              {/* --- CUSTOM GLASS DROPDOWN --- */}
              <div className="form-group" style={{position: 'relative', zIndex: 50}}>
                <label className="form-label">Department</label>
                
                {/* The Trigger Button */}
                <div 
                  className="form-input"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: isDropdownOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'
                  }}
                >
                  <span style={{color: 'white'}}>{formData.category}</span>
                  <ChevronDown size={16} color="#666" style={{transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s'}} />
                </div>

                {/* The Dropdown List (Absolute Positioned) */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
                    background: '#0a0a0f', border: '1px solid #333', borderRadius: '12px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)', overflow: 'hidden',
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    {categories.map((option) => (
                      <div 
                        key={option}
                        onClick={() => {
                          setFormData({...formData, category: option});
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          padding: '12px 16px', color: '#ccc', cursor: 'pointer', fontSize: '0.95rem',
                          transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.03)'
                        }}
                        onMouseOver={(e) => {e.target.style.background = '#00ff88'; e.target.style.color = '#000'; e.target.style.fontWeight = '600'}}
                        onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#ccc'; e.target.style.fontWeight = '400'}}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea 
                  required
                  className="form-textarea"
                  placeholder="Please provide specific details..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn-send" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Processing...' : status === 'error' ? 'Error. Try Again.' : 'Initiate Ticket'}
              </button>
            </form>
          )}
        </div>

      </div>

      <footer style={{
        textAlign: 'center', padding: '40px', borderTop: '1px solid #222', 
        color: '#444', fontSize: '0.8rem', marginTop: 'auto', background: '#020202'
      }}>
        © 2026 CashTree Network. Secured by 256-bit SSL.
      </footer>
      
      {/* Animation for the Dropdown */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}