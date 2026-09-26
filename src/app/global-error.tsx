'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[palma] unhandled root error', error);
    void fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'client',
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [error]);

  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#161719',
          color: '#F4F0E8',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <main style={{ maxWidth: '36rem', padding: '2rem', textAlign: 'center' }}>
          <p style={{ letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AAA397' }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>The record is intact</h1>
          <p style={{ color: '#D8D3C9', lineHeight: 1.6 }}>
            This page could not be rendered. Nothing has been changed; PALMA does not alter the
            record on a failed request.
          </p>
          {error.digest ? (
            <p style={{ color: '#AAA397', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              Reference {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              border: '1px solid #4A5148',
              background: 'transparent',
              color: '#F4F0E8',
              padding: '0.65rem 1rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
