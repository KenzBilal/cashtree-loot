'use client';

import { useState, useEffect } from 'react';

export default function PageReveal({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay ensures animation always plays even on instant page loads
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      opacity: ready ? 1 : 0,
      transform: ready ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    }}>
      {children}
    </div>
  );
}