'use client'
import { useState } from 'react'

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', company: ''
  })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const getStrength = () => {
    const p = form.password
    if (p.length === 0) return 0
    if (p.length < 6) return 1
    if (p.length < 10) return 2
    return 3
  }

  const strengthColor = ['#E2E8F0', '#DC2626', '#D97706', '#2D8C4E']
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong']

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.company) {
      setError('Please fill in all fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreed) {
      setError('You must agree to the Terms & Conditions')
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
        width: '100%', maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F2A4A', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#0F2A4A' }}>SEWER </span>
            <span style={{ color: '#2D8C4E' }}>LABZ</span>
          </div>
          <div style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>
            Create your free account
          </div>
          <div style={{
            display: 'inline-block', marginTop: '8px',
            background: '#E8F5EE', color: '#2D8C4E',
            fontSize: '12px', fontWeight: 600,
            padding: '4px 12px', borderRadius: '20px',
          }}>✓ 7-day free trial — no credit card required</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '8px', padding: '12px 16px',
            color: '#DC2626', fontSize: '14px', marginBottom: '20px',
          }}>{error}</div>
        )}

        {/* Fields */}
        {[
          { label: 'Full name', field: 'name', type: 'text', placeholder: 'John Smith' },
          { label: 'Email address', field: 'email', type: 'email', placeholder: 'you@company.com' },
          { label: 'Company name', field: 'company', type: 'text', placeholder: 'Acme Inspections Ltd' },
        ].map(({ label, field, type, placeholder }) => (
          <div key={field} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>
              {label}
            </label>
            <input
              type={type}
              value={form[field as keyof typeof form]}
              onChange={e => update(field, e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%', height: '42px', borderRadius: '8px',
                border: '1px solid #E2E8F0', padding: '0 14px',
                fontSize: '14px', color: '#0F172A', outline: 'none',
                boxSizing: 'border-box', background: '#F8FAFC',
              }}
            />
          </div>
        ))}

        {/* Password */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={e => update('password', e.target.value)}
            placeholder="Min 8 characters"
            style={{
              width: '100%', height: '42px', borderRadius: '8px',
              border: '1px solid #E2E8F0', padding: '0 14px',
              fontSize: '14px', color: '#0F172A', outline: 'none',
              boxSizing: 'border-box', background: '#F8FAFC',
            }}
          />
          {form.password.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', alignItems: 'center' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: '4px', flex: 1, borderRadius: '2px',
                  background: i <= getStrength() ? strengthColor[getStrength()] : '#E2E8F0',
                  transition: 'background 0.2s',
                }} />
              ))}
              <span style={{ fontSize: '12px', color: strengthColor[getStrength()], marginLeft: '6px', minWidth: '48px' }}>
                {strengthLabel[getStrength()]}
              </span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '6px' }}>
            Confirm password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => update('confirmPassword', e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', height: '42px', borderRadius: '8px',
              border: `1px solid ${form.confirmPassword && form.password !== form.confirmPassword ? '#DC2626' : '#E2E8F0'}`,
              padding: '0 14px', fontSize: '14px', color: '#0F172A',
              outline: 'none', boxSizing: 'border-box', background: '#F8FAFC',
            }}
          />
        </div>

        {/* Disclaimer box */}
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: '8px', padding: '14px 16px', marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', marginBottom: '6px' }}>
            ⚠️ Software Disclaimer
          </div>
          <div style={{ fontSize: '12px', color: '#92400E', lineHeight: '1.6' }}>
            Sewer Labz is a reporting tool only and does not constitute professional advice.
            Provided "AS IS" without warranty. You are solely responsible for data accuracy,
            report validation, and regulatory compliance.
          </div>
        </div>

        {/* Checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px' }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2D8C4E' }}
          />
          <span style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
            I have read and agree to the{' '}
            <span
              onClick={() => setShowTerms(true)}
              style={{ color: '#2D8C4E', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              Terms & Conditions
            </span>{' '}
            and Software Disclaimer
          </span>
        </div>

        {/* Button */}
        <button
          onClick={handleSignup}
          disabled={loading || !agreed}
          style={{
            width: '100%', height: '44px', borderRadius: '8px',
            background: !agreed ? '#94A3B8' : loading ? '#94A3B8' : '#2D8C4E',
            color: '#fff', border: 'none', fontSize: '15px',
            fontWeight: 600, cursor: !agreed || loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Create free account — 7 days free'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748B' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#2D8C4E', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            maxWidth: '560px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F2A4A', marginBottom: '16px' }}>
              Terms & Conditions
            </h2>
            {[
              { title: '1. Software Disclaimer', text: 'Sewer Labz is provided as a reporting tool only. It does not constitute professional engineering, legal, or regulatory advice.' },
              { title: '2. No Warranty', text: 'The software is provided "AS IS" without warranty of any kind, express or implied.' },
              { title: '3. User Responsibility', text: 'You are solely responsible for the accuracy of all data entered, validation of all reports generated, and compliance with all applicable laws and regulations.' },
              { title: '4. Limitation of Liability', text: 'Sewer Labz shall not be liable for any direct, indirect, incidental, or consequential damages resulting from use of the software.' },
              { title: '5. Indemnification', text: 'You agree to indemnify and hold harmless Sewer Labz from any claims arising from your use of the software.' },
              { title: '6. Subscription & Billing', text: 'Subscriptions auto-renew monthly or annually. You can cancel anytime from your dashboard settings.' },
              { title: '7. Auto-Renewal', text: 'By subscribing, you agree to automatic renewal at the stated price until cancelled.' },
            ].map(({ title, text }) => (
              <div key={title} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F2A4A', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>{text}</div>
              </div>
            ))}
            <button
              onClick={() => setShowTerms(false)}
              style={{
                width: '100%', height: '42px', borderRadius: '8px',
                background: '#2D8C4E', color: '#fff', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px',
              }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  )
}