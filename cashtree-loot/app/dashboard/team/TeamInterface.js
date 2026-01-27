'use client';

import { useState } from 'react';

export default function TeamInterface({ initialTeam, referralLink }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // --- 1. RANK LOGIC (The "Empire" System) ---
  const recruitCount = initialTeam.length;
  const activeCount = initialTeam.filter(m => !m.is_frozen).length;
  
  // Rank Tiers
  let rank = { title: 'SCOUT', color: '#94a3b8', next: 10, progress: 0 };
  if (recruitCount >= 100) rank = { title: 'KINGPIN', color: '#fbbf24', next: 0, progress: 100 };
  else if (recruitCount >= 50) rank = { title: 'BOSS', color: '#ef4444', next: 100, progress: (recruitCount/100)*100 };
  else if (recruitCount >= 10) rank = { title: 'CAPTAIN', color: '#a855f7', next: 50, progress: (recruitCount/50)*100 };
  else rank.progress = (recruitCount/10)*100;

  // --- 2. SEARCH FILTER ---
  const filteredTeam = initialTeam.filter(member => 
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 3. COPY HANDLER ---
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 100/100 STYLES ---
  const neonPurple = '#a855f7';
  
  const glassPanel = {
    background: 'rgba(5, 5, 5, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
    position: 'relative', overflow: 'hidden'
  };

  return (
    <div className="fade-in">
      
      {/* 1. EMPIRE STATUS CARD */}
      <div style={{
        ...glassPanel, 
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000 100%)',
        border: `1px solid ${rank.color}33`
      }}>
        {/* Glow */}
        <div style={{position:'absolute', top:'-50%', right:'-50%', width:'300px', height:'300px', background:`radial-gradient(circle, ${rank.color} 0%, transparent 70%)`, opacity:0.15, filter:'blur(80px)'}}></div>

        <div style={{position: 'relative', zIndex: 2}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <div style={{
              fontSize: '10px', color: '#000', background: rank.color, 
              padding: '4px 8px', borderRadius: '4px', fontWeight: '900', letterSpacing: '1px',
              boxShadow: `0 0 15px ${rank.color}66`
            }}>
              RANK: {rank.title}
            </div>
            <div style={{fontSize: '10px', color: '#fff', fontWeight: '700', opacity: 0.7}}>
              NETWORK STRENGTH
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px'}}>
             <div style={{
               fontSize: '52px', fontWeight: '900', color: '#fff', lineHeight: '1',
               textShadow: `0 0 30px ${rank.color}33`, letterSpacing: '-2px'
             }}>
               {recruitCount}
             </div>
             <div style={{fontSize: '13px', color: '#666', fontWeight: '700', textTransform: 'uppercase'}}>Agents</div>
          </div>

          {/* Progress Bar */}
          {rank.next > 0 && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666', marginBottom: '6px', fontWeight: '700'}}>
                <span>NEXT TIER PROGRESS</span>
                <span>{Math.round(rank.progress)}%</span>
              </div>
              <div style={{height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden'}}>
                <div style={{width: `${rank.progress}%`, height: '100%', background: rank.color, boxShadow: `0 0 10px ${rank.color}`}}></div>
              </div>
              <div style={{textAlign: 'right', fontSize: '9px', color: '#444', marginTop: '6px'}}>
                {rank.next - recruitCount} MORE TO LEVEL UP
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. INVITE LINK (Tactical Style) */}
      <div style={{marginBottom: '30px'}}>
        <div style={{fontSize: '11px', color: '#666', fontWeight: '800', letterSpacing: '1px', paddingLeft: '6px', marginBottom: '8px', textTransform: 'uppercase'}}>
          Referral Link
        </div>
        <div style={{
          display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px',
          alignItems: 'center'
        }}>
          <div style={{fontSize: '18px'}}>🔗</div>
          <div style={{flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#fff', fontSize: '13px', fontFamily: 'monospace'}}>
            {referralLink}
          </div>
          <button onClick={handleCopy} style={{
            background: copied ? neonPurple : '#fff', color: '#000',
            border: 'none', borderRadius: '8px', padding: '8px 16px', 
            fontWeight: '800', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: copied ? `0 0 15px ${neonPurple}` : 'none'
          }}>
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* 3. SEARCH & LIST */}
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 6px'}}>
          <h3 style={{fontSize: '14px', color: '#fff', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: 0}}>
            Operatives
          </h3>
          <div style={{fontSize: '11px', color: '#666', fontWeight: '700'}}>
            <span style={{color: '#00ff88'}}>{activeCount} ACTIVE</span>
          </div>
        </div>

        {/* Search Bar */}
        <input 
          type="text" 
          placeholder="🔍 Filter agents by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '16px', background: 'rgba(0,0,0,0.3)', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff',
            fontSize: '14px', outline: 'none', marginBottom: '20px',
            transition: 'border 0.2s'
          }}
        />

        {/* The List */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {filteredTeam.length > 0 ? (
            filteredTeam.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))
          ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#444', fontSize: '13px', border: '1px dashed #333', borderRadius: '16px'}}>
              {searchTerm ? 'No operative found.' : 'No recruits yet. Start building your empire.'}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------
// SUB-COMPONENT: MEMBER ITEM (Cyberpunk Row)
// ---------------------------------------------------------
function MemberItem({ member }) {
  // Generate a distinct avatar color based on username
  const colors = ['#a855f7', '#3b82f6', '#00ff88', '#f43f5e'];
  const color = colors[member.username.length % colors.length];
  
  const dateStr = new Date(member.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px', padding: '16px',
      transition: 'transform 0.2s'
    }}>
      {/* Avatar */}
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: `${color}11`, border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: '900', color: color
      }}>
        {member.username?.[0]?.toUpperCase()}
      </div>

      {/* Info */}
      <div style={{flex: 1}}>
        <div style={{fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '2px'}}>
          @{member.username}
        </div>
        <div style={{fontSize: '11px', color: '#666', fontFamily: 'monospace'}}>
          JOINED: {dateStr}
        </div>
      </div>

      {/* Status Light */}
      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
         <div style={{
           width: '6px', height: '6px', borderRadius: '50%',
           background: member.is_frozen ? '#ef4444' : '#00ff88',
           boxShadow: `0 0 8px ${member.is_frozen ? '#ef4444' : '#00ff88'}`
         }}></div>
         <div style={{fontSize: '10px', color: '#666', fontWeight: '700'}}>
           {member.is_frozen ? 'BANNED' : 'ONLINE'}
         </div>
      </div>
    </div>
  );
}