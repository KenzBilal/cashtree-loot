'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: '🏠' },
    { name: 'Earn', path: '/dashboard/campaigns', icon: '🔥' },
    { name: 'Wallet', path: '/dashboard/wallet', icon: '💰' },
    { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
  ];

  // Haptic Feedback Helper
  const handleTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15); // Stronger tick for premium feel
    }
  };

  // --- STYLES ---
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '85px', // Tall & Premium
    background: 'rgba(5, 5, 5, 0.9)', // Deep Black Glass
    backdropFilter: 'blur(20px)', // Heavy Blur
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: '16px',
    zIndex: 9999,
    paddingBottom: 'env(safe-area-inset-bottom, 20px)',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.8)' // Shadow depth
  };

  return (
    <nav style={navStyle}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            onClick={handleTap}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              width: '25%', 
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            
            {/* ACTIVE GLOW BEAM (Top) */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '-16px', 
                width: '40px',
                height: '4px',
                background: '#00ff88', // Matching Dashboard Green
                boxShadow: '0 0 15px #00ff88', // Stronger Neon Glow
                borderRadius: '0 0 4px 4px'
              }} />
            )}

            {/* BACKGROUND HIGHLIGHT (Subtle active state) */}
             {isActive && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50px',
                height: '50px',
                background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
            )}

            {/* ICON  */}
            <div style={{
              fontSize: '24px',
              marginBottom: '6px',
              color: isActive ? '#00ff88' : '#666', // Green vs Grey
              filter: isActive ? 'drop-shadow(0 0 8px rgba(0,255,136,0.6))' : 'none',
              transform: isActive ? 'translateY(-4px) scale(1.15)' : 'translateY(0) scale(1)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring Physics
            }}>
              {item.icon}
            </div>

            {/* LABEL */}
            <div style={{
              fontSize: '10px',
              fontWeight: isActive ? '800' : '500',
              color: isActive ? '#fff' : '#555',
              letterSpacing: isActive ? '0.5px' : '0',
              transition: 'all 0.3s',
              textTransform: 'uppercase'
            }}>
              {item.name}
            </div>

          </Link>
        );
      })}
    </nav>
  );
}