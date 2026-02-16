'use client';

import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#050505',
      color: 'white', fontFamily: '"Inter", sans-serif', padding: '20px',
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Background Glow FX */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0
      }} />

      {/* Glass Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '24px',
        padding: '60px 40px', maxWidth: '500px', width: '100%', textAlign: 'center',
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)'
      }}>
        
        {/* Animated Icon */}
        <div style={{
          width: '80px', height: '80px', margin: '0 auto 30px',
          background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={40} color="#ef4444" className="pulse-icon" />
        </div>

        <h1 style={{fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: '#fff'}}>
          System Under Maintenance
        </h1>
        
        <p style={{color: '#888', fontSize: '1rem', lineHeight: '1.6', marginBottom: '30px'}}>
          Our engineers are currently pushing a critical security update. 
          Access to the dashboard is temporarily restricted to ensure data integrity.
        </p>

        {/* Status Box */}
        <div style={{
          background: '#000', border: '1px solid #222', borderRadius: '12px',
          padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          marginBottom: '30px'
        }}>
          <Clock size={16} color="#ef4444" />
          <span style={{fontSize: '0.9rem', color: '#ccc', fontWeight: '600'}}>
            Estimated Downtime: <span style={{color: '#fff'}}>~30 Mins</span>
          </span>
        </div>

        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#fff', color: '#000', border: 'none', padding: '14px 28px',
            borderRadius: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px', transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = 0.9}
          onMouseOut={(e) => e.target.style.opacity = 1}
        >
          <RefreshCw size={16} /> Check Status
        </button>

      </div>

      {/* Footer */}
      <div style={{marginTop: '40px', color: '#444', fontSize: '12px', position: 'relative', zIndex: 10}}>
        Admin Access? <Link href="/login" style={{color: '#666', textDecoration: 'underline'}}>Login Here</Link>
      </div>

      <style jsx global>{`
        @keyframes pulse { 
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 
          70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } 
        }
        .pulse-icon { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
}