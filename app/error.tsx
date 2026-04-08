'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#0F2A4A]">
            SEWER <span className="text-[#2D8C4A]">LABZ</span>
          </h1>
        </div>

        {/* Error */}
        <div className="mb-6">
          <div className="text-6xl font-black text-red-600 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-3">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <p className="text-xs text-gray-400">
            Error ID: {error.digest || 'unknown'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-block bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          If the problem persists, contact support@sewerlabz.com
        </p>
      </div>
    </div>
  )
}
