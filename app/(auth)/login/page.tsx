'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: any) => {
    e.preventDefault()

    // ✅ Fake login (frontend only)
    if (email && password) {
      localStorage.setItem('user', JSON.stringify({ email }))
      router.push('/')
    } else {
      alert('Enter email and password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-[#2D8C4A] text-white py-3 rounded-lg">
          Login
        </button>

        <p className="text-sm mt-4 text-center">
          No account? <Link href="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </form>
    </div>
  )
}