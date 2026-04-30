'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Calendar, MessageSquare, Save, Sun, Moon, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string
  email: string
  theme: string
  createdAt: string
  _count: { chatSessions: number }
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(r => r.json())
        .then(data => {
          setProfile(data.user)
          setName(data.user.name || '')
          setTheme(data.user.theme || 'dark')
          setLoading(false)
        })
    }
  }, [status])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, theme })
      })
      if (res.ok) {
        // Apply theme
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        await update({ name })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const initials = name ? name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) : session?.user?.email?.[0]?.toUpperCase() || 'U'
  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-orange-600 flex items-center justify-center text-white text-3xl font-bold mb-4 ring-4 ring-orange-500/30">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : initials}
          </div>
          <h2 className="text-xl font-semibold text-white">{name || 'User'}</h2>
          <p className="text-slate-400 text-sm">{profile?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
            <MessageSquare className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{profile?._count?.chatSessions || 0}</p>
            <p className="text-slate-400 text-sm">Chat Sessions</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
            <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white mt-1">{joinDate}</p>
            <p className="text-slate-400 text-sm">Member Since</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Edit Profile</h3>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-1" /> Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" /> Email Address
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full bg-slate-700/50 text-slate-400 rounded-lg px-4 py-3 border border-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Theme Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Appearance Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-orange-500 text-white'
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark Mode
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light Mode
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
