'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()

  // ✅ Dummy user (no Firebase)
  const [user] = useState<any>({
    displayName: 'Demo User',
    email: 'demo@sewerlabz.com'
  })

  // ✅ Dummy stats (no API)
  const [stats] = useState({
    totalReports: 0,
    monthReports: 0,
    drafts: 0,
    templatesUsed: 0
  })

  const [reports] = useState<any[]>([])
  const [loading] = useState(false)

  // ✅ No auth check (frontend only)
  useEffect(() => {
    // do nothing
  }, [])

  const handleLogout = async () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* Sidebar */}
      <div className="w-64 bg-[#0F2A4A] min-h-screen flex flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">
            SEWER <span className="text-[#2D8C4A]">LABZ</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Professional Reports</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/" className="text-white bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            📊 Dashboard
          </Link>
          <Link href="/reports/new" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            📝 New Report
          </Link>
          <Link href="/templates" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            📋 Templates
          </Link>
          <Link href="/settings" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            ⚙️ Settings
          </Link>
        </nav>

        {/* User */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#2D8C4A] flex items-center justify-center text-white font-bold text-sm">
              {user.displayName[0]}
            </div>
            <div>
              <p className="text-white text-xs font-medium">{user.displayName}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-lg text-sm text-left"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Welcome back, {user.displayName} 👋
            </h2>
            <p className="text-gray-500 text-sm mt-1">Frontend preview mode</p>
          </div>
          <Link
            href="/reports/new"
            className="bg-[#2D8C4A] text-white px-5 py-2.5 rounded-lg text-sm"
          >
            + New Report
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl">
            <p className="text-xs text-gray-500">Total Reports</p>
            <p className="text-3xl font-bold">{stats.totalReports}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl">
            <p className="text-xs text-gray-500">This Month</p>
            <p className="text-3xl font-bold">{stats.monthReports}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl">
            <p className="text-xs text-gray-500">Drafts</p>
            <p className="text-3xl font-bold">{stats.drafts}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl">
            <p className="text-xs text-gray-500">Templates</p>
            <p className="text-3xl font-bold">{stats.templatesUsed}</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white p-10 rounded-2xl text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">No reports yet (frontend mode)</p>
        </div>

      </div>
    </div>
  )
}