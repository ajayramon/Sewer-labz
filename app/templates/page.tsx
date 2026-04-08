'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/app/Lib/firebase'
import { signOut } from 'firebase/auth'
import Link from 'next/link'

export default function TemplatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        // Load templates from database
        loadTemplates()
      }
    })
    return () => unsubscribe()
  }, [router])

  const loadTemplates = async () => {
    // TODO: Load templates from database
    setTemplates([])
  }

  const handleLogout = async () => {
    await signOut(auth)
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
          <Link href="/" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/reports/new" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm transition-colors">
            📝 New Report
          </Link>
          <Link href="/templates" className="text-white bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            📋 Templates
          </Link>
          <Link href="/settings" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm transition-colors">
            ⚙️ Settings
          </Link>
        </nav>

        {/* User info */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#2D8C4A] flex items-center justify-center text-white font-bold text-sm">
              {user?.displayName ? user.displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="text-white text-xs font-medium">{user?.displayName || 'User'}</p>
              <p className="text-gray-400 text-xs truncate w-36">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-lg text-sm transition-colors text-left"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F2A4A]">Report Templates</h1>
              <p className="text-gray-600 mt-2">Create and manage your custom report templates</p>
            </div>
            <button className="bg-[#2D8C4E] hover:bg-[#246b3a] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              + Create Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-6">Create your first custom report template to get started</p>
                <button className="bg-[#2D8C4E] hover:bg-[#246b3a] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Create Your First Template
                </button>
              </div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-[#0F2A4A]">{template.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Draft</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#2D8C4E] hover:bg-[#246b3a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Use Template
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}