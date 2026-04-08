'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/app/Lib/firebase'
import { signOut } from 'firebase/auth'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalReports: 0,
    monthReports: 0,
    drafts: 0,
    templatesUsed: 0
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000)) : null
  const trialLabel = subscription?.plan === 'TRIAL'
    ? trialDaysLeft !== null
      ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left`
      : 'Trial active'
    : subscription?.plan
      ? `${subscription.plan.toUpperCase()} plan`
      : 'Free Plan'
  const trialDescription = subscription?.plan === 'TRIAL'
    ? 'Your free trial is active. Subscribe now to keep generating reports without interruption.'
    : 'You are currently on the free plan. Upgrade anytime to unlock more reports and priority support.'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        fetchDashboardData(user.uid)
      }
    })
    return () => unsubscribe()
  }, [router])

  const fetchDashboardData = async (uid: string) => {
    try {
      const res = await fetch(`/api/dashboard?uid=${uid}`)
      const data = await res.json()
      if (data.stats) setStats(data.stats)
      if (data.subscription) setSubscription(data.subscription)
      if (data.reports) setReports(data.reports)
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
    } finally {
      setLoading(false)
    }
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
          <Link href="/" className="text-white bg-white/10 px-4 py-2.5 rounded-lg text-sm">
            📊 Dashboard
          </Link>
          <Link href="/reports/new" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm transition-colors">
            📝 New Report
          </Link>
          <Link href="/templates" className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm transition-colors">
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

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">
              Welcome back, {user?.displayName || 'there'} 👋
            </h2>
            <p className="text-gray-500 text-sm mt-1">Here's your inspection overview</p>
          </div>
          <Link
            href="/reports/new"
            className="bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            + New Report
          </Link>
        </div>

        {/* Trial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#0F172A]">Free Trial</p>
                <p className="mt-3 text-3xl font-black text-[#2D8C4A]">
                  {trialLabel}
                </p>
                <p className="text-sm text-gray-500 mt-2 max-w-xl">
                  {trialDescription}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center rounded-full bg-[#2D8C4A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#246b3a]"
                >
                  Subscribe
                </Link>
                <p className="text-xs text-gray-400">
                  {subscription?.status ? `Status: ${subscription.status}` : 'Status: Free'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#0F172A]">What’s been done</p>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between rounded-xl bg-white p-4 border border-gray-200">
                <span>Reports created this month</span>
                <strong className="text-[#0F172A]">{stats.monthReports}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white p-4 border border-gray-200">
                <span>Open drafts</span>
                <strong className="text-[#0F172A]">{stats.drafts}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white p-4 border border-gray-200">
                <span>Templates used</span>
                <strong className="text-[#0F172A]">{stats.templatesUsed}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Reports</p>
            <p className="text-3xl font-black text-[#0F2A4A] mt-1">
              {loading ? '...' : stats.totalReports}
            </p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">This Month</p>
            <p className="text-3xl font-black text-[#2D8C4A] mt-1">
              {loading ? '...' : stats.monthReports}
            </p>
            <p className="text-xs text-gray-400 mt-1">Reports created</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Drafts</p>
            <p className="text-3xl font-black text-[#f59e0b] mt-1">
              {loading ? '...' : stats.drafts}
            </p>
            <p className="text-xs text-gray-400 mt-1">In progress</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Templates Used</p>
            <p className="text-3xl font-black text-[#0F2A4A] mt-1">
              {loading ? '...' : stats.templatesUsed}
            </p>
            <p className="text-xs text-gray-400 mt-1">Custom templates</p>
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#0F172A]">Recent Reports</h3>
            <Link href="/reports" className="text-sm text-[#2D8C4A] hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 font-medium">No reports yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first inspection report to get started</p>
              <Link
                href="/reports/new"
                className="mt-4 inline-block bg-[#2D8C4A] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#246b3a] transition-colors"
              >
                + Create First Report
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Client</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Location</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => (
                  <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium text-[#0F172A]">{report.client_name || '-'}</td>
                    <td className="py-3 text-sm text-gray-500">{report.location || '-'}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {report.inspection_date ? new Date(report.inspection_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        report.status === 'COMPLETE' ? 'bg-green-100 text-green-700' :
                        report.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/reports/${report.id}`}
                          className="text-xs text-[#2D8C4A] hover:underline font-medium"
                        >
                          View
                        </Link>
                        <Link
                          href={`/reports/${report.id}/edit`}
                          className="text-xs text-[#0F2A4A] hover:underline font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}