export const dynamic = "force-dynamic"
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/Lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/')
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email.')
          break
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.')
          break
        case 'auth/invalid-email':
          setError('Invalid email address.')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.')
          break
        default:
          setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0F2A4A]">
            SEWER <span className="text-[#2D8C4A]">LABZ</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Access inspection reports, PDF exports, and reporting templates.</p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#0F172A] mb-2">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mb-6">New users can create an account and start a free trial.</p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A] focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <span className="text-sm text-gray-400">Forgot password? Contact support.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#2D8C4A] font-medium hover:underline">
            Create one free
          </Link>
        </p>

      </div>
    </div>
  )
}