'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Bot, User, Globe, Paperclip, X, FileText, Image, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { languages, translations, defaultLanguage, type LanguageCode } from '@/lib/languages'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  fileName?: string
}

interface ChatSession {
  id: string
  agentType: string
  title: string
  createdAt: string
  updatedAt: string
  _count: { messages: number }
}

interface ChatInterfaceProps {
  agentType: string
  onBack: () => void
  onAgentChange?: (agentType: string) => void
}

const agentNames: Record<string, string> = {
  company: 'NRsolution4u Assistant',
  internship: 'Internship Agent',
  job: 'Job Agent',
  career_consultant: 'Career Consultant',
  resume_analyzer: 'Resume Analyzer'
}

const agentColors: Record<string, string> = {
  company: 'bg-blue-600',
  internship: 'bg-green-600',
  job: 'bg-purple-600',
  career_consultant: 'bg-orange-600',
  resume_analyzer: 'bg-pink-600',
}

const thinkingMessages: Record<string, string[]> = {
  resume_analyzer: ['📄 Reading your resume...','🔍 Analyzing structure & formatting...','💡 Evaluating skills & keywords...','📊 Calculating ATS compatibility...','✍️ Preparing your score report...'],
  company: ['🔎 Searching company data...','💼 Fetching relevant info...','🤔 Thinking...'],
  internship: ['🎯 Finding internship matches...','🤔 Thinking...','📋 Preparing guidance...'],
  job: ['💼 Scanning job opportunities...','🤔 Thinking...','📋 Preparing recommendations...'],
  career_consultant: ['🧠 Analyzing your career path...','🤔 Thinking...','📋 Crafting personalized advice...'],
}
const fileThinkingMessages = ['📂 Reading your file...','🔍 Extracting content...','🧠 Analyzing...','✍️ Preparing response...']

function ThinkingIndicator({ isFile, agentType }: { isFile: boolean; agentType: string }) {
  const pool = isFile ? fileThinkingMessages : (thinkingMessages[agentType] || thinkingMessages.career_consultant)
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setIndex(prev => (prev + 1) % pool.length), 1800)
    return () => clearInterval(interval)
  }, [pool.length])
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-slate-300">{pool[index]}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  )
}

export default function ChatInterface({ agentType, onBack, onAgentChange }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Load chat sessions list
  const loadSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions')
      if (res.ok) {
        const data = await res.json()
        setChatSessions(data.sessions || [])
      }
    } catch (e) { console.error('Failed to load sessions', e) }
  }

  useEffect(() => { loadSessions() }, [])

  // Load a specific session's messages
  const loadSession = async (sid: string, sessionAgentType?: string) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/chat/sessions/${sid}`)
      if (res.ok) {
        const data = await res.json()
        const msgs: Message[] = data.session.messages.map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt),
        }))
        setMessages(msgs)
        setSessionId(sid)
        // Switch to correct agent type if different
        const targetAgent = sessionAgentType || data.session.agentType
        if (targetAgent && targetAgent !== agentType && onAgentChange) {
          onAgentChange(targetAgent)
        }
      }
    } catch (e) { console.error('Failed to load session', e) }
    finally { setLoadingHistory(false) }
  }

  // Delete a session
  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/chat/sessions/${sid}`, { method: 'DELETE' })
    setChatSessions(prev => prev.filter(s => s.id !== sid))
    if (sessionId === sid) startNewChat()
  }

  // Start a fresh chat
  const startNewChat = () => {
    setSessionId(null)
    setMessages([getWelcomeMessage(agentType, selectedLanguage)])
    setInput('')
    setSelectedFile(null)
  }

  const translateMessages = async (newLanguage: LanguageCode) => {
    setIsTranslating(true)
    try {
      // Always update welcome message in new language
      const welcomeMsg = getWelcomeMessage(agentType, newLanguage)

      if (messages.length <= 1) {
        // Only welcome message — just replace it
        setMessages([welcomeMsg])
        setIsTranslating(false)
        return
      }

      const messagesToTranslate = messages.slice(1)
      const res = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesToTranslate.map(m => m.content), targetLanguage: newLanguage }),
      })
      if (res.ok) {
        const data = await res.json()
        const translated = messagesToTranslate.map((msg, idx) => ({ ...msg, content: data.translations[idx] || msg.content }))
        setMessages([welcomeMsg, ...translated])
      } else {
        // Translation API failed — at least update welcome message
        setMessages(prev => [welcomeMsg, ...prev.slice(1)])
      }
    } catch (e) {
      console.error('Translation error', e)
      // On error — still update welcome message
      setMessages(prev => [getWelcomeMessage(agentType, newLanguage), ...prev.slice(1)])
    } finally { setIsTranslating(false) }
  }

  const handleLanguageChange = async (newLanguage: LanguageCode) => {
    setSelectedLanguage(newLanguage)
    setShowLanguageMenu(false)
    await translateMessages(newLanguage)
  }

  const getWelcomeMessage = (type: string, language: LanguageCode): Message => {
    const welcomeMessages: Record<string, Record<LanguageCode, string>> = {
      company: {
        en: `Hello! I'm your official NRsolution4u Career Assistant. I'm here to help you learn about NRsolution4u's internship programs, training opportunities, and career paths. What would you like to know?`,
        hi: `नमस्ते! मैं आपका आधिकारिक NRsolution4u करियर सहायक हूं। हमारी टीम में शामिल होने के बारे में आप क्या जानना चाहेंगे?`,
        hinglish: `Hello! Main aapka official NRsolution4u Career Assistant hoon. Hamare team ke baare mein aap kya jaanna chahenge?`,
        mr: `नमस्कार! मी तुमचा अधिकृत NRsolution4u करिअर सहाय्यक आहे. आमच्या टीममध्ये सामील होण्याबद्दल तुम्हाला काय जाणून घ्यायचे आहे?`,
        es: `¡Hola! Soy tu asistente oficial de carrera de NRsolution4u. ¿Qué te gustaría saber?`,
        fr: `Bonjour! Je suis votre assistant de carrière officiel NRsolution4u. Que souhaitez-vous savoir?`,
        de: `Hallo! Ich bin Ihr offizieller NRsolution4u Karriereassistent. Was möchten Sie wissen?`,
        zh: `你好！我是你的官方NRsolution4u职业助手。你想了解什么？`,
        ja: `こんにちは！私はあなたの公式NRsolution4uキャリアアシスタントです。何を知りたいですか？`,
        ar: `مرحبا! أنا مساعد مهنتك الرسمي في NRsolution4u. ماذا تريد أن تعرف؟`,
        pt: `Olá! Eu sou seu assistente de carreira oficial da NRsolution4u. O que você gostaria de saber?`
      },
      internship: {
        en: `Hello! I'm your Internship Agent. I'm here to help you with internship opportunities, applications, and career guidance. What can I assist you with today?`,
        hi: `नमस्ते! मैं आपका इंटर्नशिप एजेंट हूं। आज मैं आपकी किस चीज़ में सहायता कर सकता हूं?`,
        hinglish: `Hello! Main aapka Internship Agent hoon. Aaj main aapki kis cheez mein madad kar sakta hoon?`,
        mr: `नमस्कार! मी तुमचा इंटर्नशिप एजेंट आहे. आज मी तुम्हाला कशात मदत करू शकतो?`,
        es: `¡Hola! Soy tu agente de pasantías. ¿En qué puedo ayudarte hoy?`,
        fr: `Bonjour! Je suis votre agent de stage. En quoi puis-je vous aider aujourd'hui?`,
        de: `Hallo! Ich bin Ihr Praktikumsagent. Womit kann ich Ihnen heute helfen?`,
        zh: `你好！我是你的实习代理。今天我能帮你什么？`,
        ja: `こんにちは！私はあなたのインターンシップエージェントです。今日は何をお手伝いできますか？`,
        ar: `مرحبا! أنا وكيل التدريب الخاص بك. بماذا يمكنني مساعدتك اليوم؟`,
        pt: `Olá! Eu sou seu agente de estágio. No que posso ajudá-lo hoje?`
      },
      job: {
        en: `Hello! I'm your Job Search Agent. I'm here to help you find employment opportunities and advance your career. How can I help you today?`,
        hi: `नमस्ते! मैं आपका जॉब सर्च एजेंट हूं। आज मैं आपकी कैसे मदद कर सकता हूं?`,
        hinglish: `Hello! Main aapka Job Search Agent hoon. Aaj main aapki kaise madad kar sakta hoon?`,
        mr: `नमस्कार! मी तुमचा जॉब सर्च एजेंट आहे. आज मी तुम्हाला कशी मदत करू शकतो?`,
        es: `¡Hola! Soy tu agente de búsqueda de empleo. ¿Cómo puedo ayudarte hoy?`,
        fr: `Bonjour! Je suis votre agent de recherche d'emploi. Comment puis-je vous aider aujourd'hui?`,
        de: `Hallo! Ich bin Ihr Jobsuchagent. Wie kann ich Ihnen heute helfen?`,
        zh: `你好！我是你的求职代理。今天我能帮你什么？`,
        ja: `こんにちは！私はあなたの求職エージェントです。今日は何をお手伝いできますか？`,
        ar: `مرحبا! أنا وكيل البحث عن وظيفة. كيف يمكنني مساعدتك اليوم؟`,
        pt: `Olá! Eu sou seu agente de busca de emprego. Como posso ajudá-lo hoje?`
      },
      career_consultant: {
        en: `Hello! I'm your Career Consultant. I'm here to provide strategic career guidance and professional development advice. What aspect of your career would you like to discuss?`,
        hi: `नमस्ते! मैं आपका करियर सलाहकार हूं। आप अपने करियर के किस पहलू पर चर्चा करना चाहेंगे?`,
        hinglish: `Hello! Main aapka Career Consultant hoon. Aap apne career ke kis aspect par discuss karna chahenge?`,
        mr: `नमस्कार! मी तुमचा करिअर सल्लागार आहे. तुम्ही तुमच्या करिअरच्या कोणत्या पैलूवर चर्चा करू इच्छिता?`,
        es: `¡Hola! Soy tu consultor de carrera. ¿Qué aspecto de tu carrera te gustaría discutir?`,
        fr: `Bonjour! Je suis votre consultant en carrière. Quel aspect de votre carrière aimeriez-vous discuter?`,
        de: `Hallo! Ich bin Ihr Karriereberater. Welchen Aspekt Ihrer Karriere möchten Sie besprechen?`,
        zh: `你好！我是你的职业顾问。你想讨论职业的哪个方面？`,
        ja: `こんにちは！私はあなたのキャリアコンサルタントです。キャリアのどの側面について話し合いたいですか？`,
        ar: `مرحبا! أنا مستشار حياتك المهنية. ما هو الجانب من حياتك المهنية الذي تريد مناقشته؟`,
        pt: `Olá! Eu sou seu consultor de carreira. Que aspecto de sua carreira você gostaria de discutir?`
      },
      resume_analyzer: {
        en: `Hello! I'm your Resume Analyzer. Upload your resume and I'll give you a detailed analysis with scores across 8 key areas. Let's make your resume stand out!`,
        hi: `नमस्ते! मैं आपका Resume Analyzer हूं। अपना resume upload करें और मैं आपको 8 प्रमुख क्षेत्रों में विस्तृत विश्लेषण दूंगा।`,
        hinglish: `Hello! Main aapka Resume Analyzer hoon. Apna resume upload karo aur main tumhe 8 key areas mein detailed analysis dunga!`,
        mr: `नमस्कार! मी तुमचा Resume Analyzer आहे. तुमचा resume upload करा आणि मी 8 क्षेत्रांमध्ये विश्लेषण देईन!`,
        es: `¡Hola! Soy tu Analizador de Currículum. ¡Sube tu currículum y te daré un análisis detallado!`,
        fr: `Bonjour! Je suis votre Analyseur de CV. Téléchargez votre CV pour une analyse détaillée!`,
        de: `Hallo! Ich bin Ihr Lebenslauf-Analysator. Laden Sie Ihren Lebenslauf für eine detaillierte Analyse hoch!`,
        zh: `你好！我是你的简历分析器。上传你的简历，我将给你详细分析！`,
        ja: `こんにちは！私はあなたの履歴書アナライザーです。履歴書をアップロードして詳細な分析を受けましょう！`,
        ar: `مرحبا! أنا محلل سيرتك الذاتية. قم بتحميل سيرتك للحصول على تحليل مفصل!`,
        pt: `Olá! Eu sou seu Analisador de Currículo. Faça upload do seu currículo para uma análise detalhada!`
      }
    }
    const agentMsgs = welcomeMessages[type] || welcomeMessages.career_consultant
    return { id: '1', role: 'assistant', content: agentMsgs[language] || agentMsgs.en, timestamp: new Date() }
  }

  useEffect(() => {
    setMessages([getWelcomeMessage(agentType, selectedLanguage)])
  }, [agentType])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, agentType, sessionId, conversationHistory: messages.slice(-10), language: selectedLanguage }),
      })
      if (res.ok) {
        const data = await res.json()
        setSessionId(data.sessionId)
        if (data.sessionId && data.sessionId !== 'demo-session') loadSessions()
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, timestamp: new Date() }])
      } else throw new Error('Failed')
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }])
    } finally { setLoading(false) }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    setFileUploading(true)
    const userMessage: Message = {
      id: Date.now().toString(), role: 'user',
      content: input.trim() ? `📎 ${selectedFile.name}\n${input}` : `📎 ${selectedFile.name}`,
      timestamp: new Date(), fileName: selectedFile.name
    }
    setMessages(prev => [...prev, userMessage])
    const question = input.trim() || (agentType === 'resume_analyzer' ? 'Analyze this resume and provide detailed scoring report.' : 'Analyze this file and give career-related insights.')
    setInput('')
    setSelectedFile(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('question', question)
      formData.append('agentType', agentType)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      const content = res.ok ? (data.response || 'File analyzed successfully.') : (data.error || 'Failed to analyze file.')
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date() }])
    } catch (err) {
      console.error('File upload error:', err)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ File upload timed out. Please try again with a smaller file or use PDF format.', timestamp: new Date() }])
    } finally { setFileUploading(false) }
  }

  const handleSend = () => { if (selectedFile) handleFileUpload(); else sendMessage() }

  const exportChatAsPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const agentName = agentNames[agentType] || agentType
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 18
    const contentWidth = pageWidth - margin * 2
    let y = margin

    const checkNewPage = (needed: number) => {
      if (y + needed > pageHeight - 15) {
        doc.addPage()
        y = margin
      }
    }

    const cleanText = (text: string) =>
      text
        .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
        .replace(/[\u{2600}-\u{27BF}]/gu, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/#{1,4}\s+/g, '')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 -> $2')
        .replace(/^[-*•]\s+/gm, '• ')
        .replace(/---+/g, '')
        .replace(/>\s*/gm, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/&rsquo;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

    // ── PAGE HEADER (only first page) ──
    doc.setFillColor(234, 88, 12)
    doc.rect(0, 0, pageWidth, 22, 'F')

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(agentName, margin, 10)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Chat Export  |  ' + new Date().toLocaleString('en-IN'), margin, 17)

    y = 30

    // ── MESSAGES ──
    const chatMessages = messages.filter(m => m.id !== '1')

    chatMessages.forEach((msg) => {
      const isUser = msg.role === 'user'
      const time = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      const clean = cleanText(msg.content)
      const lines = doc.splitTextToSize(clean, contentWidth - 4)

      // Estimate block height: label(6) + lines + padding(6)
      const blockH = 6 + lines.length * 5.5 + 8
      checkNewPage(blockH + 6)

      if (isUser) {
        // ── USER MESSAGE ──
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(234, 88, 12)
        doc.text('You', margin, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(time, pageWidth - margin, y, { align: 'right' })
        y += 5

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(30, 30, 30)
        lines.forEach((line: string) => {
          checkNewPage(6)
          doc.text(line, margin, y)
          y += 5.5
        })

        // Divider
        y += 3
        doc.setDrawColor(234, 88, 12)
        doc.setLineWidth(0.3)
        doc.line(margin, y, pageWidth - margin, y)
        y += 5

      } else {
        // ── AGENT MESSAGE ──
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(30, 100, 200)
        doc.text(agentName, margin, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(time, pageWidth - margin, y, { align: 'right' })
        y += 5

        // Render lines — detect URLs for blue color
        const urlRegex = /https?:\/\/[^\s)>]+/g
        doc.setFontSize(10)

        lines.forEach((line: string) => {
          checkNewPage(6)

          // Check if line contains URL
          const urlMatch = line.match(urlRegex)
          if (urlMatch) {
            // Render URL in blue
            doc.setTextColor(37, 99, 235)
            doc.setFont('helvetica', 'normal')
            doc.text(line, margin, y)
            // Add clickable link
            const url = urlMatch[0]
            const textWidth = doc.getTextWidth(line)
            doc.link(margin, y - 4, textWidth, 5, { url })
          } else if (line.startsWith('•')) {
            doc.setTextColor(60, 60, 60)
            doc.setFont('helvetica', 'normal')
            doc.text(line, margin + 2, y)
          } else {
            doc.setTextColor(30, 30, 30)
            doc.setFont('helvetica', 'normal')
            doc.text(line, margin, y)
          }
          y += 5.5
        })

        // Divider
        y += 3
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 5
      }
    })

    // ── FOOTER on all pages ──
    const totalPages = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Page ${i} of ${totalPages}  |  ${agentName}  |  Career Platform`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      )
    }

    doc.save(`${agentName.replace(/\s+/g, '-')}-chat-${Date.now()}.pdf`)
  }

  const renderMessageWithLinks = (text: string) => {
    const lines = text.split('\n')
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return lines.map((line, lineIdx) => {
      if (line.startsWith('## ')) return <h2 key={lineIdx} className="text-lg font-bold text-orange-400 mt-3 mb-1">{line.replace('## ', '')}</h2>
      if (line.startsWith('### ')) return <h3 key={lineIdx} className="text-base font-bold text-orange-300 mt-2 mb-1">{line.replace('### ', '')}</h3>
      if (line === '---') return <hr key={lineIdx} className="border-slate-600 my-2" />
      const boldParts = line.split(/(\*\*[^*]+\*\*)/g)
      const rendered = boldParts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        const urlParts = part.split(urlRegex)
        return urlParts.map((p, j) => p.match(urlRegex)
          ? <a key={j} href={p} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline break-all">{p}</a>
          : <span key={j}>{p}</span>)
      })
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={lineIdx} className="flex gap-2 my-0.5"><span className="text-orange-400 mt-0.5">•</span><span>{rendered}</span></div>
      if (line.includes('Score:') || line.includes('/ 100') || line.includes('/ 20') || line.includes('/ 10')) return <div key={lineIdx} className="bg-slate-700 rounded px-2 py-1 my-1 text-orange-300 font-semibold">{rendered}</div>
      return <div key={lineIdx} className={line === '' ? 'my-1' : ''}>{rendered}</div>
    })
  }

  const agentColor = agentColors[agentType] || 'bg-orange-600'

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col`}>
        <div className="p-3 border-b border-slate-700">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-xs text-slate-500 px-2 py-1 font-semibold uppercase tracking-wider">Chat History</p>
          {loadingHistory && <div className="text-xs text-slate-400 px-2 py-2">Loading...</div>}
          {chatSessions.length === 0 && !loadingHistory && (
            <p className="text-xs text-slate-500 px-2 py-2">No previous chats</p>
          )}
          {chatSessions.map(s => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id, s.agentType)}
              className={`group flex items-start gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors mb-1 ${sessionId === s.id ? 'bg-slate-700' : 'hover:bg-slate-700/60'}`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate">{s.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    s.agentType === 'company' ? 'bg-blue-600/20 text-blue-400' :
                    s.agentType === 'internship' ? 'bg-green-600/20 text-green-400' :
                    s.agentType === 'job' ? 'bg-purple-600/20 text-purple-400' :
                    s.agentType === 'career_consultant' ? 'bg-orange-600/20 text-orange-400' :
                    s.agentType === 'resume_analyzer' ? 'bg-pink-600/20 text-pink-400' :
                    'bg-slate-600/20 text-slate-400'
                  }`}>
                    {agentNames[s.agentType] || s.agentType}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{s._count.messages} msgs · {new Date(s.updatedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors" title="Toggle history">
                {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
              <div>
                <h1 className="text-lg font-semibold text-white">{agentNames[agentType]}</h1>
                <p className="text-xs text-slate-400">{translations[selectedLanguage].aiPoweredAssistant}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={startNewChat} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Chat
              </button>
              {messages.length > 1 && (
                <button onClick={exportChatAsPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors" title="Export chat as PDF">
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
              )}
              {/* Language Selector */}
              <div className="relative">
                <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Globe className="w-4 h-4 text-slate-300" />
                  <span className="text-sm text-slate-300">{languages[selectedLanguage].flag} {languages[selectedLanguage].nativeName}</span>
                </button>
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs text-slate-400 px-3 py-2 font-semibold">{translations[selectedLanguage].selectLanguage}</p>
                      {Object.entries(languages).map(([code, lang]) => (
                        <button key={code} onClick={() => handleLanguageChange(code as LanguageCode)} disabled={isTranslating}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${selectedLanguage === code ? 'bg-orange-600 text-white' : 'hover:bg-slate-700 text-slate-300'} ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <span className="text-lg">{lang.flag}</span>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{lang.nativeName}</span>
                            <span className="text-xs opacity-70">{lang.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isTranslating && (
            <div className="flex justify-center">
              <div className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">{translations[selectedLanguage].translating}</span>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-full ${agentColor} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-3xl px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
                <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline break-all">
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    h2: ({ children }) => <h2 className="text-lg font-bold text-orange-400 mt-3 mb-1">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold text-orange-300 mt-2 mb-1">{children}</h3>,
                    hr: () => <hr className="border-slate-600 my-2" />,
                    ul: ({ children }) => <ul className="space-y-1 my-1">{children}</ul>,
                    ol: ({ children }) => <ol className="space-y-1 my-1 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => <li className="flex gap-2"><span className="text-orange-400 mt-0.5 flex-shrink-0">•</span><span>{children}</span></li>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-orange-500 pl-3 text-slate-400 italic my-1">{children}</blockquote>,
                    code: ({ children }) => <code className="bg-slate-700 px-1 rounded text-orange-300 text-xs">{children}</code>,
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-200' : 'text-slate-400'}`}>
                  {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-orange-500">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : session?.user?.name ? (
                    <span className="text-white text-sm font-bold select-none">
                      {session.user.name.trim().split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  ) : session?.user?.email ? (
                    <span className="text-white text-sm font-bold select-none">{session.user.email[0].toUpperCase()}</span>
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
            </div>
          ))}
          {(loading || fileUploading) && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 rounded-full ${agentColor} flex items-center justify-center flex-shrink-0 animate-pulse`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-2xl max-w-xs">
                <ThinkingIndicator isFile={fileUploading} agentType={agentType} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
              {selectedFile.type.startsWith('image/') ? <Image className="w-4 h-4 text-orange-400" /> : <FileText className="w-4 h-4 text-orange-400" />}
              <span className="text-sm text-slate-300 flex-1 truncate">{selectedFile.name}</span>
              <span className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(0)}KB</span>
              <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-400"><X className="w-4 h-4" /></button>
            </div>
          )}
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); if (fileInputRef.current) fileInputRef.current.value = '' }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={loading || fileUploading} className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-50" title="Upload file">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={selectedFile ? 'Ask something about this file... (optional)' : translations[selectedLanguage].typeMessage}
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              rows={1}
              disabled={loading || fileUploading}
            />
            <button onClick={handleSend} disabled={(!input.trim() && !selectedFile) || loading || fileUploading} className="btn-primary px-5 disabled:opacity-50 disabled:cursor-not-allowed">
              {(loading || fileUploading) ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">📎 Supports: Images, PDF, Word, TXT (max 10MB)</p>
        </div>
      </div>
    </div>
  )
}
