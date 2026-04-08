import Link from 'next/link'

export default function NotFound() {
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
          <div className="text-6xl font-black text-[#2D8C4A] mb-4">404</div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Page Not Found</h2>
          <p className="text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-block bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/reports/new"
            className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create a Report
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          Need help? Contact support@sewerlabz.com
        </p>
      </div>
    </div>
  )
}
