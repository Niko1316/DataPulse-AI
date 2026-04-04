'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AppError({
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
    <div
      style={{ backgroundColor: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}
      className="flex items-center justify-center p-6"
    >
      <div
        style={{ backgroundColor: '#141414', border: '1px solid #222' }}
        className="rounded-xl p-10 max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <AlertTriangle size={48} style={{ color: '#ff3d3d' }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a0a0a0' }} className="text-sm">
            An error occurred in the dashboard. Your data is safe — please try again.
          </p>
          {error.digest && (
            <p style={{ color: '#a0a0a0' }} className="text-xs font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <div
            style={{ backgroundColor: '#0a0a0a', border: '1px solid #ff3d3d', color: '#ff3d3d' }}
            className="rounded-lg p-4 text-left text-xs font-mono break-all"
          >
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => unstable_retry()}
            style={{ backgroundColor: '#7b2ff7', color: '#e5e5e5' }}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            style={{ border: '1px solid #222', color: '#a0a0a0' }}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm hover:border-[#7b2ff7] hover:text-[#7b2ff7] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
