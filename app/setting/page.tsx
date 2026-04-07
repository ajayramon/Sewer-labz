'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/app/Lib/firebase'
import { updatePassword, updateProfile, signOut } from 'firebase/auth'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [displayName, setDisplayName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setDisplayName(user.displayName || '')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await updateProfile(user, { displayName })
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError('Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await updatePassword(user, newPassword)
      setSuccess('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('Failed to update password. Please log out and log in again first.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'password', label: '🔒 Password' },
    { id: 'company', label: '🏢 Company' },
    { id: 'subscription', label: '💳 Subscription' },
  ]

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
          <Link href="/templates" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm transition-colors">
            📋 Templates
          </Link>
          <Link href="/settings" className="text-white bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            ⚙️ Settings
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2.5 rounded-lg text-sm transition-colors text-left"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F172A]">Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0F2A4A] flex items-center justify-center text-white text-2xl font-bold">
              {user?.displayName ? user.displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-lg">{user?.displayName || 'User'}</h3>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="text-xs bg-[#2D8C4A]/10 text-[#2D8C4A] px-2 py-0.5 rounded-full font-medium">Free Plan</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess('') }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0F2A4A] text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Success/Error */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-[#0F172A] mb-4">Profile Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-[#0F172A] mb-4">Change Password</h3>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-[#0F172A] mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="LV Sewer Inspections"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Company Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-400 text-sm">Click to upload logo</p>
                    <p className="text-gray-300 text-xs mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1">Tagline</label>
                  <input
                    type="text"
                    placeholder="Don't Let Your Drain Be A Pain!"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A]"
                  />
                </div>
                <button className="bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
                  Save Company Info
                </button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-[#0F172A] mb-4">Subscription & Billing</h3>

              {/* Current Plan */}
              <div className="border border-[#2D8C4A] rounded-xl p-4 mb-6 bg-[#2D8C4A]/5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-[#0F172A]">Free Plan</p>
                    <p className="text-sm text-gray-500">Up to 5 reports per month</p>
                  </div>
                  <span className="bg-[#2D8C4A] text-white text-xs px-3 py-1 rounded-full font-medium">Active</span>
                </div>
              </div>

              {/* Upgrade Plans */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-bold text-[#0F172A] mb-1">Starter</h4>
                  <p className="text-2xl font-black text-[#0F2A4A]">$29<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>✅ 20 reports/month</li>
                    <li>✅ Custom branding</li>
                    <li>✅ PDF export</li>
                  </ul>
                  <button className="mt-3 w-full bg-[#0F2A4A] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a5c] transition-colors">
                    Upgrade
                  </button>
                </div>
                <div className="border border-[#2D8C4A] rounded-xl p-4 relative">
                  <span className="absolute -top-2 left-3 bg-[#2D8C4A] text-white text-xs px-2 py-0.5 rounded-full">Popular</span>
                  <h4 className="font-bold text-[#0F172A] mb-1">Professional</h4>
                  <p className="text-2xl font-black text-[#0F2A4A]">$79<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>✅ Unlimited reports</li>
                    <li>✅ Team members</li>
                    <li>✅ Priority support</li>
                  </ul>
                  <button className="mt-3 w-full bg-[#2D8C4A] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#246b3a] transition-colors">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}