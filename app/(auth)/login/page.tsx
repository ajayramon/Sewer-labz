'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/'
    }, 1500)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Inter, sans-serif',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #E2E8F0', padding: '40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F2A4A', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#0F2A4A' }}>SEWER </span>
            <span style={{ color: '#2D8C4E' }}>LABZ</span>
          </div>
          <div style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>
            Sign in to your account
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '8px', padding: '12px 16px',
            color: '#DC2626', fontSize: '14px', marginBottom: '20px',
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              width: '100%', height: '42px', borderRadius: '8px',
              border: '1px solid #E2E8F0', padding: '0 14px',
              fontSize: '14px', color: '#0F172A', outline: 'none',
              boxSizing: 'border-box', background: '#F8FAFC',
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', height: '42px', borderRadius: '8px',
                border: '1px solid #E2E8F0', padding: '0 44px 0 14px',
                fontSize: '14px', color: '#0F172A', outline: 'none',
                boxSizing: 'border-box', background: '#F8FAFC',
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: '16px',
              }}
            >{showPassword ? '🙈' : '👁️'}</button>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginBottom: '24px' }}>
          <a href="/reset-password" style={{ fontSize: '13px', color: '#2D8C4E', textDecoration: 'none' }}>
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', height: '44px', borderRadius: '8px',
            background: loading ? '#94A3B8' : '#2D8C4E',
            color: '#fff', border: 'none', fontSize: '15px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748B' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: '#2D8C4E', fontWeight: 600, textDecoration: 'none' }}>
            Start free trial
          </a>
        </div>
      </div>
    </div>
  )
}