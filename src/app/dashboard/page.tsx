'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Briefcase, GraduationCap, Users, LogOut, FileText, User, Sun, Moon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import ChatInterface from '@/components/ChatInterface'
import { useTheme } from '@/lib/theme'

const agents = [
  {
    id: 'company',
    name: 'NRsolution4u Assistant',
    description: 'Learn about NRsolution4u internship programs, training opportunities, and get website links/addresses for any company',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    questions: [
      'Tell me about NRsolution4u internship programs',
      'NRsolution4u website and address link',
      'What training opportunities does NRsolution4u offer?',
      'Google website link and address'
    ]
  },
  {
    id: 'internship',
    name: 'Internship Agent',
    description: 'Find internship opportunities with detailed company information, application guidance, and interview preparation',
    icon: GraduationCap,
    color: 'from-green-500 to-green-600',
    questions: [
      'Find tech internships at Google and Microsoft',
      'What internship programs does Goldman Sachs offer?',
      'How do I prepare for consulting internship interviews?',
      'McKinsey website and internship details'
    ]
  },
  {
    id: 'job',
    name: 'Job Agent',
    description: 'Discover job opportunities with comprehensive company details, salary information, and career advancement strategies',
    icon: Briefcase,
    color: 'from-purple-500 to-purple-600',
    questions: [
      'Amazon job opportunities and application process',
      'Tesla website and career information',
      'What jobs are available at consulting firms?',
      'Microsoft salary ranges and work culture'
    ]
  },
  {
    id: 'career_consultant',
    name: 'Career Consultant',
    description: 'Get comprehensive career guidance with company culture insights, professional development advice, and strategic planning',
    icon: Users,
    color: 'from-orange-500 to-orange-600',
    questions: [
      'Google company culture and career development',
      'Best companies for leadership development',
      'Apple website and professional growth opportunities',
      'How do I transition to management consulting?'
    ]
  },
  {
    id: 'resume_analyzer',
    name: 'Resume Analyzer',
    description: 'Upload your resume and get a detailed score report across 8 key areas — structure, skills, projects, ATS compatibility, and more',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    questions: [
      'Analyze my resume for a software developer role',
      'How ATS-friendly is my resume?',
      'What skills am I missing for a data science role?',
      'How can I improve my resume score?'
    ]
  }
]

export default function DashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (selectedAgent) {
    return (
      <div className="min-h-screen bg-slate-900">
        <ChatInterface
          agentType={selectedAgent}
          onBack={() => setSelectedAgent(null)}
          onAgentChange={(newAgent) => setSelectedAgent(newAgent)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-xl p-2 border border-slate-700 group-hover:border-orange-500 transition-all duration-300">
                <img src="/nrsolution-logo.png" alt="NRsolution4u" className="h-10 w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Career Platform</h1>
              <p className="text-slate-400 text-sm">Welcome, {session.user?.name || session.user?.email}!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5 text-slate-300" />
              }
            </button>

            {/* Profile */}
            <Link href="/profile"
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold overflow-hidden">
                {session.user?.image
                  ? <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : (session.user?.name?.[0] || session.user?.email?.[0] || 'U').toUpperCase()
                }
              </div>
              <span className="text-sm hidden sm:block">Profile</span>
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="text-center mb-12">
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Choose an AI agent to help you with your career journey. Each agent specializes in different aspects of career development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {agents.map((agent) => {
            const IconComponent = agent.icon
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="card hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{agent.name}</h3>
                <p className="text-slate-400 mb-6">{agent.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300 mb-3">Example questions:</p>
                  {agent.questions.map((question, index) => (
                    <div key={index} className="text-sm text-slate-400 bg-slate-700/50 rounded-lg px-3 py-2">
                      "{question}"
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <button className="btn-primary w-full group-hover:bg-orange-500 transition-colors duration-300">
                    Start Conversation
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
