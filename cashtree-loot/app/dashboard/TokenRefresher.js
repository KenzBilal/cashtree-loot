'use client';

import { useEffect } from 'react';

// Silently updates the HttpOnly cookies with new tokens after a server-side refresh.
// Fires once on mount, user never sees it, page renders normally.
export default function TokenRefresher({ newAccessToken, newRefreshToken, children }) {
  useEffect(() => {
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token:  newAccessToken,
        refresh_token: newRefreshToken,
      }),
    }).catch(() => {
      // Silent fail — worst case they get refreshed next request
    });
  }, []);

  return children;
}