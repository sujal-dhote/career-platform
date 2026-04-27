import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { findQAMatch } from '@/lib/nrsolution-qa'

export const maxDuration = 60

const apiKeys = [
  process.env.GEMINI_API_KEY!,
  process.env.GEMINI_API_KEY_2!,
  process.env.GEMINI_API_KEY_3!,
].filter(Boolean)

function getGenAI(keyIndex = 0) {
  return new GoogleGenerativeAI(apiKeys[keyIndex % apiKeys.length])
}

const resumePrompt = `You are an expert Resume Analyzer. Analyze this resume and provide a detailed report:

## 📋 Resume Analyzer – Result Report

### 👤 Candidate Details
- **Name:** [Extract from resume]
- **Email:** [Extract from resume]
- **Contact Number:** [Extract from resume]
- **Position Applied For:** [Extract or suggest based on skills]

---
### ⭐ Overall Resume Score: [XX / 100]

---

### 1. 📐 Resume Structure & Formatting — Score: [XX / 20]
- Layout: [clear/cluttered/inconsistent]
- Font and spacing: [professional/need improvement]

### 2. 🎯 Career Objective / Summary — Score: [XX / 10]
- Objective: [clear/generic/missing]
- [Specific feedback]

### 3. 💻 Technical Skills — Score: [XX / 20]
- Skills: [relevant/outdated/incomplete]
- [Missing key technologies]

### 4. 🚀 Projects & Experience — Score: [XX / 20]
- Projects: [well explained/lack detail]
- [Specific feedback]

### 5. 🎓 Education — Score: [XX / 10]
- [Complete/missing details feedback]

### 6. 🏆 Achievements & Certifications — Score: [XX / 10]
- [Relevant/limited/missing feedback]

### 7. ✍️ Language Quality — Score: [XX / 10]
- Grammar: [good/needs improvement]

### 8. 🔍 ATS Compatibility — Score: [XX / 10]
- ATS: [friendly/not optimized]
- Missing keywords: [list them]

---
### ✅ Final Feedback
**💪 Strengths:** [3 strengths]
**📈 Improvements:** [3 improvements]`

// Extract readable text from PDF buffer (basic extraction)
function extractTextFromBuffer(buffer: Buffer, mimeType: string): string {
  try {
    const raw = buffer.toString('latin1')
    // Extract text between BT and ET markers (PDF text objects)
    const textMatches = raw.match(/BT[\s\S]*?ET/g) || []
    let extracted = ''
    for (const block of textMatches) {
      const strings = block.match(/\(([^)]+)\)/g) || []
      extracted += strings.map(s => s.slice(1, -1)).join(' ') + '\n'
    }
    // Also try UTF-8 readable parts
    const utf8 = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t\u0900-\u097F]/g, ' ')
    const combined = (extracted + ' ' + utf8).replace(/\s+/g, ' ').trim()
    return combined.slice(0, 6000)
  } catch {
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim().slice(0, 6000)
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const question = (formData.get('question') as string) || 'Analyze this file and give career-related insights.'
    const agentType = (formData.get('agentType') as string) || ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 })

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (!allowedTypes.includes(file.type))
      return NextResponse.json({ error: 'File type not supported.' }, { status: 400 })

    const isResume = agentType === 'resume_analyzer' ||
      /resume|cv/i.test(file.name) ||
      /resume|cv|curriculum/i.test(question)

    const isImage = file.type.startsWith('image/')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite']
    let response = ''

    for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
      for (const modelName of models) {
        try {
          const model = getGenAI(keyIdx).getGenerativeModel({ model: modelName })
          let result

          if (isImage) {
            // Images — use inline data (fast for images)
            result = await model.generateContent([
              { inlineData: { mimeType: file.type as any, data: buffer.toString('base64') } },
              { text: isResume ? resumePrompt : `You are a helpful career assistant. ${question}` }
            ])
          } else {
            // PDF/Word/Text — extract text and send as text prompt (much faster)
            const textContent = extractTextFromBuffer(buffer, file.type)
            const prompt = isResume
              ? `${resumePrompt}\n\n---\nResume Text Content:\n${textContent}`
              : `You are a helpful career assistant. ${question}\n\nFile content:\n${textContent}`
            result = await model.generateContent(prompt)
          }

          response = result.response.text()
          if (response) break
        } catch (e: any) {
          if (e?.status === 503 || e?.status === 429) {
            await new Promise(r => setTimeout(r, 2000))
            continue
          }
          console.error(`Upload error key${keyIdx} ${modelName}:`, e?.status, e?.message)
          continue
        }
      }
      if (response) break
    }

    if (!response) {
      const qaFallback = findQAMatch(question)
      if (qaFallback) return NextResponse.json({ response: qaFallback })
      return NextResponse.json({
        response: `⚠️ AI service is currently busy. Please try again in 30 seconds.`
      })
    }

    return NextResponse.json({
      response: isResume
        ? response + '\n\n---\n\n### 📥 Download ATS-Friendly Resume Template\n\nImprove your resume using this professionally designed ATS-optimized template:\n\n**[⬇️ Download ATS Resume Template (PDF)](https://career-platform-omega.vercel.app/ats-resume-template.pdf)**\n\n> This template follows all ATS best practices — clean formatting, proper sections, keyword-optimized structure.'
        : response,
      fileName: file.name
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Failed to analyze file' }, { status: 500 })
  }
}
