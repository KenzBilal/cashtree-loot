'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already chosen
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
    // Here you would normally trigger your analytics (Google/Facebook pixels)
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
      width: '90%', maxWidth: '400px',
      background: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px'}}>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <div style={{
            background: 'rgba(0, 255, 136, 0.1)', padding: '10px', borderRadius: '12px',
            color: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Cookie size={24} />
          </div>
          <div>
            <h4 style={{margin: 0, color: 'white', fontSize: '1rem', fontWeight: '700'}}>Cookie Policy</h4>
            <span style={{fontSize: '0.8rem', color: '#666'}}>Privacy & Tracking</span>
          </div>
        </div>
        <button onClick={handleDecline} style={{background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px'}}>
          <X size={20} />
        </button>
      </div>

      {/* Text */}
      <p style={{color: '#999', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px'}}>
        We use cookies to enhance your experience, analyze traffic, and personalize content. By clicking "Accept", you consent to our use of cookies.
      </p>

      {/* Actions */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
        <button 
          onClick={handleDecline}
          style={{
            padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#ccc', fontSize: '0.9rem', fontWeight: '600',
            cursor: 'pointer', transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Decline
        </button>
        <button 
          onClick={handleAccept}
          style={{
            padding: '12px', borderRadius: '10px', border: 'none',
            background: '#00ff88', color: '#000', fontSize: '0.9rem', fontWeight: '700',
            cursor: 'pointer', boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
          }}
        >
          Accept All
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}