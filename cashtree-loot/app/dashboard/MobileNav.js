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
      navigator.vibrate(10); // Tiny vibration tick
    }
  };

  // --- STYLES ---
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '80px', // Slightly taller for better touch area
    background: 'rgba(5, 5, 5, 0.85)', // Translucent Black
    backdropFilter: 'blur(12px)', // iOS Glass Effect
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-start', // Align to top to give space for home bar
    paddingTop: '12px',
    zIndex: 9999,
    paddingBottom: 'env(safe-area-inset-bottom, 20px)'
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
              width: '25%', // Equal spacing
              position: 'relative',
              WebkitTapHighlightColor: 'transparent', // Removes blue flash on click
            }}
          >
            
            {/* ACTIVE GLOW INDICATOR */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '-12px', // Hugs the top border
                width: '40px',
                height: '2px',
                background: '#22c55e',
                boxShadow: '0 0 10px #22c55e', // Glowing effect
                borderRadius: '0 0 4px 4px'
              }} />
            )}

            {/* ICON (Bounces when active) */}
            <div style={{
              fontSize: '22px',
              marginBottom: '6px',
              filter: isActive ? 'drop-shadow(0 0 5px rgba(34,197,94,0.5))' : 'none', // Glow
              transform: isActive ? 'translateY(-2px) scale(1.1)' : 'translateY(0) scale(1)',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring animation
            }}>
              {item.icon}
            </div>

            {/* LABEL */}
            <div style={{
              fontSize: '10px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#fff' : '#666',
              letterSpacing: '0.5px',
              transition: 'color 0.2s'
            }}>
              {item.name}
            </div>

          </Link>
        );
      })}
    </nav>
  );
}