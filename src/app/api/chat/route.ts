import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateResponse } from '@/lib/gemini'
import { NRSOLUTION_KNOWLEDGE } from '@/lib/nrsolution-data'
import { findQAMatch } from '@/lib/nrsolution-qa'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { searchJobs, extractJobQuery, generateJobLinks } from '@/lib/parallel-search'

export const maxDuration = 60 // Vercel max for Hobby plan

const apiKeys = [
  process.env.GEMINI_API_KEY!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
].filter(Boolean)

function getGenAI(keyIndex = 0) {
  return new GoogleGenerativeAI(apiKeys[keyIndex % apiKeys.length])
}

// Save messages to DB (fire-and-forget, won't block response)
async function saveMessages(
  sessionId: string,
  userMessage: string,
  aiResponse: string
) {
  try {
    await prisma.chatMessage.createMany({
      data: [
        { sessionId, role: 'user', content: userMessage },
        { sessionId, role: 'assistant', content: aiResponse },
      ]
    })
    // Update session updatedAt
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })
  } catch (e) {
    console.error('Failed to save messages:', e)
  }
}

// Get or create a chat session for the user
async function getOrCreateSession(
  userEmail: string,
  agentType: string,
  sessionId: string | null,
  firstMessage: string
): Promise<string> {
  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) return 'guest'

  // If sessionId provided and belongs to user, reuse it
  if (sessionId && sessionId !== 'demo-session') {
    const existing = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: user.id }
    })
    if (existing) return existing.id
  }

  // Create new session with title from first message
  const title = firstMessage.length > 50
    ? firstMessage.slice(0, 50) + '...'
    : firstMessage

  const newSession = await prisma.chatSession.create({
    data: { userId: user.id, agentType, title }
  })
  return newSession.id
}

export async function POST(request: NextRequest) {
  try {
    const { message, agentType, conversationHistory, language, sessionId: incomingSessionId } = await request.json()

    if (!message || !agentType) {
      return NextResponse.json({ error: 'Message and agent type are required' }, { status: 400 })
    }

    // Get logged-in user for DB saving
    const authSession = await getServerSession()
    const userEmail = authSession?.user?.email || null

    // For company agent
    if (agentType === 'company') {
      const languageMap: Record<string, string> = {
        en: 'Respond in English.',
        hi: 'Please respond in Hindi.',
        hinglish: 'Please respond in Hinglish (Hindi in Roman script mixed with English).',
        mr: 'Please respond in Marathi.',
        es: 'Por favor responde en espanol.',
        fr: 'Veuillez repondre en francais.',
        de: 'Bitte antworten Sie auf Deutsch.',
        zh: 'Please respond in Chinese.',
        ja: 'Please respond in Japanese.',
        ar: 'Please respond in Arabic.',
        pt: 'Por favor, responda em portugues.'
      }
      const langInstruction = languageMap[language || 'en'] || languageMap.en
      let historyText = ''
      if (conversationHistory && conversationHistory.length > 0) {
        historyText = '\nPrevious conversation:\n'
        conversationHistory.slice(-6).forEach((msg: any) => {
          historyText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
        })
      }

      const prompt = `${NRSOLUTION_KNOWLEDGE}

RULES:
- Give SPECIFIC details from the knowledge base above
- Keep response SHORT (3-5 sentences or bullet points max)
- If asked about workshops/MOU/seminars — list them with details
- If asked for YouTube/videos/photos — give prayatn link + Instagram + phone
- NEVER say you don't have information — use the data above
${historyText}

IMPORTANT LANGUAGE RULE: ${langInstruction} You MUST respond ONLY in this language. Do not use any other language.

User question: ${message}`

      const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']
      let aiResponse = ''

      for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
        for (const modelName of models) {
          try {
            const model = getGenAI(keyIdx).getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)
            aiResponse = result.response.text()
            break
          } catch (e: any) {
            if (e?.status === 503 || e?.status === 429) {
              await new Promise(resolve => setTimeout(resolve, 500))
              continue
            }
            throw e
          }
        }
        if (aiResponse) break
      }

      if (!aiResponse) {
        const qaMatch = findQAMatch(message)
        aiResponse = qaMatch || `I'm having trouble connecting right now. Here's what I can tell you:

**NRsolution4u Quick Info:**
- Website: https://www.nrsolution4u.com/prayatn/
- Contact: 8411064860
- Email: contact.nrsolution4u@gmail.com
- Address: Cabin No. 47, Narula Building, Near Lokmat Square, Dhantoli, Nagpur

**Placements:** Mphasis (16L), LTIMindtree (15.9L), Infosys (10.5L), TCS, HCL, Cognizant and more.`
      }

      const finalResponse = aiResponse + '\n\n---\n📄 **Want to know more about NRsolution4u?**\nExplore our complete profile, achievements, and services:\n👉 https://nrsolution4u.com/profile24.pdf'

      // Save to DB
      let savedSessionId = incomingSessionId || null
      if (userEmail) {
        savedSessionId = await getOrCreateSession(userEmail, agentType, incomingSessionId, message)
        if (savedSessionId !== 'guest') {
          saveMessages(savedSessionId, message, finalResponse)
        }
      }

      return NextResponse.json({ response: finalResponse, sessionId: savedSessionId || 'demo-session' })
    }

    // For job and internship agents — add live search results
    if (agentType === 'job' || agentType === 'internship') {
      const isJobQuery = /job|work|hiring|vacancy|opening|position|career|salary|apply|recruit|find|search|looking|want|need|get/i.test(message)
      const isInternQuery = /internship|intern|training|stipend|fresher|student/i.test(message)

      const aiResponse = await generateResponse(message, agentType, conversationHistory || [], language || 'en')

      let finalResponse = aiResponse

      if (isJobQuery || isInternQuery) {
        // Generate proper working job portal links
        const jobLinks = generateJobLinks(message, agentType)

        // Also try Parallel AI for additional results (non-blocking)
        const { query, objective } = extractJobQuery(message)
        const parallelResults = await searchJobs(query, objective).catch(() => '')

        const label = agentType === 'internship' ? 'Internship' : 'Job'
        finalResponse = `${aiResponse}\n\n---\n🔍 **Live ${label} Search Links:**\n\n${jobLinks}${parallelResults ? '\n\n**Additional Results:**\n' + parallelResults : ''}`
      }

      let savedSessionId = incomingSessionId || null
      if (userEmail) {
        savedSessionId = await getOrCreateSession(userEmail, agentType, incomingSessionId, message)
        if (savedSessionId !== 'guest') saveMessages(savedSessionId, message, finalResponse)
      }

      return NextResponse.json({ response: finalResponse, sessionId: savedSessionId || 'demo-session' })
    }

    // For other agents
    const aiResponse = await generateResponse(message, agentType, conversationHistory || [], language || 'en')

    // Save to DB
    let savedSessionId = incomingSessionId || null
    if (userEmail) {
      savedSessionId = await getOrCreateSession(userEmail, agentType, incomingSessionId, message)
      if (savedSessionId !== 'guest') {
        saveMessages(savedSessionId, message, aiResponse)
      }
    }

    return NextResponse.json({ response: aiResponse, sessionId: savedSessionId || 'demo-session' })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
