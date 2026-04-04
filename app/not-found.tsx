import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
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
          <AlertTriangle size={48} style={{ color: '#00d4ff' }} />
        </div>

        <div className="space-y-2">
          <p className="text-6xl font-bold" style={{ color: '#00d4ff' }}>
            404
          </p>
          <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>
            Page not found
          </h1>
          <p style={{ color: '#a0a0a0' }} className="text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            style={{ backgroundColor: '#00d4ff', color: '#0a0a0a' }}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
