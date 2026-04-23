'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const password = searchParams.get('password')

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!email) router.push('/signup')
  }, [email, router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const otpCode = otp.join('')
    if (otpCode.length !== 6) { setError('Please enter complete OTP'); return }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess('Email verified successfully! Logging you in...')
        if (password) {
          const result = await signIn('credentials', { email, password, redirect: false })
          setTimeout(() => router.push(result?.ok ? '/' : '/login'), 1500)
        } else {
          setTimeout(() => router.push('/login'), 1500)
        }
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setSuccess('')
    setResending(true)
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok) { setSuccess('New OTP sent to your email!'); setOtp(['', '', '', '', '', '']) }
      else setError(data.error || 'Failed to resend OTP')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-slate-400">We've sent a 6-digit code to</p>
            <p className="text-orange-500 font-semibold mt-1">{email}</p>
          </div>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  disabled={loading} />
              ))}
            </div>
            {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">{success}</div>}
            <button type="submit" disabled={loading || otp.join('').length !== 6} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Verifying...</span> : 'Verify Email'}
            </button>
            <div className="text-center">
              <button type="button" onClick={handleResendOTP} disabled={resending} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
            <div className="text-center">
              <Link href="/signup" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Signup
              </Link>
            </div>
          </form>
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 text-center">The verification code will expire in 10 minutes. If you don't receive the email, check your spam folder.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
