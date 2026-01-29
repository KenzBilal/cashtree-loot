'use client';

import { useState } from 'react';
import { X, ChevronRight, Zap, ShieldCheck, Clock } from 'lucide-react';

export default function CampaignsInterface({ campaigns, promoterId }) {
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="fade-in">
      
      {/* 1. EMPTY STATE CHECK */}
      {campaigns.length === 0 ? (
        <div style={{textAlign: 'center', padding: '60px 20px', border: '1px dashed #333', borderRadius: '20px'}}>
          <div style={{fontSize: '40px', marginBottom: '16px'}}>😴</div>
          <h3 style={{color: '#fff', fontSize: '18px', fontWeight: 'bold'}}>No Missions Available</h3>
          <p style={{color: '#666', fontSize: '13px'}}>Check back later for new earning opportunities.</p>
        </div>
      ) : (
        /* 2. THE GRID */
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px'
        }}>
          {campaigns.map((camp, index) => (
            <div 
              key={camp.id} 
              onClick={() => setSelectedTask(camp)}
              style={{
                background: '#0a0a0f', 
                border: '1px solid #1a1a1a', 
                borderRadius: '20px', 
                padding: '20px', 
                cursor: 'pointer',
                position: 'relative',
                animation: `slideUp 0.4s ease-out ${index * 0.05}s backwards`,
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Card Header */}
              <div style={{display: 'flex', gap: '14px', alignItems: 'flex-start'}}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', 
                  background: '#111', flexShrink: 0, overflow: 'hidden',
                  border: '1px solid #222'
                }}>
                  <img 
                    src={camp.icon_url || 'https://via.placeholder.com/60/111/333'} 
                    alt={camp.title}
                    style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                  />
                </div>

                <div style={{flex: 1}}>
                  <h3 style={{
                    color: '#fff', fontWeight: '800', fontSize: '15px', 
                    lineHeight: '1.3', marginBottom: '6px'
                  }}>
                    {camp.title}
                  </h3>
                  
                  {/* Category Tag */}
                  <span style={{
                    fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', 
                    borderRadius: '6px', background: '#1a1a1a', color: '#888',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {camp.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Card Footer: Price */}
              <div style={{
                marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #222',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{fontSize: '11px', color: '#666', fontWeight: '700'}}>
                  REWARD
                </div>
                <div style={{
                  color: '#00ff88', fontSize: '16px', fontWeight: '900',
                  textShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
                }}>
                  ₹{camp.payout_amount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* 3. THE POPUP MODAL (Task Details) */}
      {selectedTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'end', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedTask(null)}>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="slide-up-modal"
            style={{
              width: '100%', maxWidth: '480px', 
              background: '#0a0a0f', 
              borderTop: '1px solid #333',
              borderRadius: '24px 24px 0 0', 
              padding: '30px', 
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px'}}>
              <img 
                src={selectedTask.icon_url} 
                style={{width: '64px', height: '64px', borderRadius: '16px', border: '1px solid #333'}} 
              />
              <button onClick={() => setSelectedTask(null)} style={{
                background: '#1a1a1a', border: 'none', borderRadius: '50%', width: '32px', height: '32px', 
                color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                <X size={18} />
              </button>
            </div>

            <h2 style={{color: '#fff', fontSize: '22px', fontWeight: '900', lineHeight: '1.2', marginBottom: '12px'}}>
              {selectedTask.title}
            </h2>
            
            {/* Badges */}
            <div style={{display: 'flex', gap: '8px', marginBottom: '24px'}}>
              <Badge text="Instant Payment" color="#00ff88" bg="rgba(0, 255, 136, 0.1)" icon={<Zap size={10} />} />
              <Badge text="Verified" color="#3b82f6" bg="rgba(59, 130, 246, 0.1)" icon={<ShieldCheck size={10} />} />
            </div>

            {/* Description */}
            <div style={{
              background: '#111', borderRadius: '16px', padding: '20px', 
              marginBottom: '24px', border: '1px solid #222'
            }}>
               <h4 style={{color: '#666', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px'}}>
                 INSTRUCTIONS
               </h4>
               <p style={{color: '#ddd', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>
                 {selectedTask.description || "Complete the steps to earn your reward."}
               </p>
            </div>

            {/* START BUTTON */}
            <a 
              href={`${selectedTask.landing_url}${selectedTask.landing_url.includes('?') ? '&' : '?'}sub1=${promoterId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '18px', borderRadius: '16px',
                background: '#fff', color: '#000', 
                fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px',
                textDecoration: 'none', boxShadow: '0 0 30px rgba(255,255,255,0.2)'
              }}
            >
              Start Mission <ChevronRight size={18} />
            </a>

            <div style={{textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#444', fontWeight: '600'}}>
              Clicking starts tracking. Do not use VPN.
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Badge Component
function Badge({ text, color, bg, icon }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '10px', fontWeight: '800', color: color, background: bg,
      padding: '6px 12px', borderRadius: '8px'
    }}>
      {icon} {text}
    </span>
  );
}