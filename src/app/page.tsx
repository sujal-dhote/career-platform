'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ArrowRight, Building2, Briefcase, GraduationCap, Users, LogOut } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 border border-slate-700 group-hover:border-orange-500 transition-all duration-300">
                <img
                  src="/nrsolution-logo.png"
                  alt="NRsolution4u"
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    img.style.display = 'none'
                    const fallback = img.parentElement?.nextElementSibling as HTMLElement
                    if (fallback) fallback.classList.remove('hidden')
                  }}
                />
              </div>
            </div>
            <div className="hidden">
              <h1 className="text-2xl font-bold text-white">Career Platform</h1>
              <p className="text-xs text-orange-400">AI-Powered Guidance</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {status === 'loading' ? (
              <div className="text-white">Loading...</div>
            ) : session ? (
              <>
                <span className="text-white">Welcome, {session.user?.name || session.user?.email}!</span>
                <Link href="/dashboard" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-6 py-2 text-white hover:text-orange-400 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your AI-Powered
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              {' '}Career Platform
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Get personalized career guidance from specialized AI agents. Whether you're looking for companies, internships, jobs, or career advice, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-slate-900 transition-colors inline-flex items-center gap-2">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">NRsolution4u Assistant</h3>
            <p className="text-slate-400">Learn about NRsolution4u's internship programs, training opportunities, and career paths.</p>
          </div>
          <div className="card text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Internship Agent</h3>
            <p className="text-slate-400">Find internship opportunities tailored to your skills and career goals.</p>
          </div>
          <div className="card text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Job Agent</h3>
            <p className="text-slate-400">Discover job opportunities that align with your experience and aspirations.</p>
          </div>
          <div className="card text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Career Consultant</h3>
            <p className="text-slate-400">Get comprehensive career guidance and professional development advice.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to accelerate your career?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are using AI-powered career guidance to achieve their goals.
          </p>
          {session ? (
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
