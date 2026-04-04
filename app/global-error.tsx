'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#0a0a0a',
          color: '#e5e5e5',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#141414',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <AlertTriangle size={48} style={{ color: '#ff3d3d' }} />
          </div>

          <h1
            style={{
              color: '#e5e5e5',
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '14px', margin: '0 0 24px 0' }}>
            A critical error occurred. Please try again or return to the home page.
          </p>

          {process.env.NODE_ENV === 'development' && error?.message && (
            <div
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #ff3d3d',
                color: '#ff3d3d',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginBottom: '24px',
              }}
            >
              {error.message}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => unstable_retry()}
              style={{
                backgroundColor: '#00d4ff',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '200px',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                border: '1px solid #222',
                color: '#a0a0a0',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'block',
                width: '100%',
                maxWidth: '200px',
                boxSizing: 'border-box',
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
