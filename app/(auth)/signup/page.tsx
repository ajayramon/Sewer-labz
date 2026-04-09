export const dynamic = "force-dynamic"
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/app/Lib/firebase'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (!agreed) {
      setError('You must agree to the Terms & Conditions.')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      await updateProfile(userCredential.user, {
        displayName: fullName
      })

      // Save user to database
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          email,
          name: fullName,
          companyName
        })
      })

      setSuccess('Account created successfully. Please sign in to continue.')
      router.push('/login')
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.')
          break
        case 'auth/invalid-email':
          setError('Invalid email address.')
          break
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 8 characters.')
          break
        default:
          setError('Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0F2A4A]">
            SEWER <span className="text-[#2D8C4A]">LABZ</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Start your free trial today with no credit card required.</p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#0F172A] mb-2">Create your account</h2>
        <p className="text-sm text-gray-500 mb-6">Sign up and then log in to access your dashboard, reports, and templates.</p>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {success}
          </div>
        )}
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Heath R. Browning"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A] focus:border-transparent"
            />
          </div>

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
              Company name
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="LV Sewer Inspections"
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
              placeholder="Min. 8 characters"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8C4A] focus:border-transparent"
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 rounded"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I have read and agree to the{' '}
              <button
                type="button"
                className="text-[#2D8C4A] hover:underline font-medium"
                onClick={() => alert('Terms & Conditions')}
              >
                Terms & Conditions
              </button>{' '}
              and{' '}
              <button
                type="button"
                className="text-[#2D8C4A] hover:underline font-medium"
                onClick={() => alert('SOFTWARE DISCLAIMER')}
              >
                SOFTWARE DISCLAIMER
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D8C4A] hover:bg-[#246b3a] text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create free account'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2D8C4A] font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}